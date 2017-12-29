/* eslint new-cap: "off" */

import React from 'react';
import cx from 'classnames';
import CalHeatMap from 'cal-heatmap';
import 'cal-heatmap/cal-heatmap.css';
import { Loading, InfoCard, CardGroup } from 'light-ui';
import Api from 'API';
import 'SRC/vendor/share/github-calendar.css';
import styles from '../styles/github.css';
import cardStyles from '../styles/info_card.css';
import locales, { formatLocale } from 'LOCALES';
import formatHotmap from '../utils/hotmap';

const githubTexts = locales('github').sections.hotmap;

class Hotmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      hotmap: {
        start: null,
        end: null,
        datas: null,
        total: null,
        streak: null,
      }
    }
    this.githubCalendar = false;
  }

  componentDidUpdate() {
    const { login } = this.props;
    if (!this.githubCalendar && login && $('#cal-heatmap')[0]) {
      this.getHotmap(login);
    }
  }

  async getHotmap(login) {
    this.githubCalendar = true;
    const result = await Api.github.getUserHotmap(login);
    const hotmap = formatHotmap(result);
    const local = formatLocale();
    const cal = new CalHeatMap();
    this.setState({
      loaded: true,
      hotmap
    });
    const {
      start,
      datas,
      levelRanges,
    } = hotmap;
    console.log(hotmap);
    cal.init({
      domain: 'month',
      start: new Date(start),
      data: datas,
      weekStartOnMonday: local === 'zh-CN',
      subDomain: 'day',
      range: 13,
      displayLegend: false,
      previousSelector: '#hotmap-left',
      nextSelector: '#hotmap-right',
      legend: levelRanges,
      domainLabelFormat: '%Y-%m',
      legendColors: {
        min: '#DCDCDC',
        max: '#196127',
        empty: '#DCDCDC'
      }
    });
  }

  renderCardGroup() {
    const { hotmap } = this.state;
    const { renderCards } = this.props;
    if (!hotmap.datas || !renderCards) return null;
    const {
      end,
      start,
      total,
      streak,
    } = hotmap;

    return (
      <CardGroup
        className={cx(
          cardStyles.card_group,
          styles.hotmapCards
        )}
      >
        <CardGroup>
          <InfoCard
            icon="terminal"
            tipsoTheme="dark"
            mainText={total}
            subText={githubTexts.total}
            tipso={{
              text: `${start} ~ ${end}`
            }}
          />
          <InfoCard
            tipsoTheme="dark"
            mainText={`${streak.weekly.start}~${streak.weekly.end}`}
            subText={githubTexts.weekly}
            tipso={{
              text: `Totally ${streak.weekly.count} commits`
            }}
          />
        </CardGroup>
        <CardGroup>
          <InfoCard
            tipsoTheme="dark"
            mainText={streak.daily.date}
            subText={githubTexts.daily}
            tipso={{
              text: `${streak.daily.count} commits`
            }}
          />
          <InfoCard
            icon="thumb-tack"
            tipsoTheme="dark"
            mainText={streak.longest.count}
            subText={githubTexts.longestStreak}
            tipso={{
              text: streak.longest.start
                ? `${streak.longest.start} ~ ${streak.longest.end}`
                : githubTexts.streakError
            }}
          />
          <InfoCard
            tipsoTheme="dark"
            mainText={streak.current.count}
            subText={githubTexts.currentStreak}
            tipso={{
              text: streak.current.start
                ? `${streak.current.start} ~ ${streak.current.end}`
                : githubTexts.streakError
            }}
          />
        </CardGroup>
      </CardGroup>
    );
  }

  render() {
    const { loaded } = this.state;
    const { className } = this.props;
    return (
      <div
        className={cx(
          styles.githubCalendar,
          className
        )}
      >
        <Loading className={styles.loading} loading={!loaded} />
        <div id="cal-heatmap" className={styles.githubHotmap} />
        <div className={styles.hotmapControllers}>
          <div className={styles.hotmapController} id="hotmap-left">
            <i
              aria-hidden="true"
              className="fa fa-angle-left"
            />
          </div>
          <div className={styles.hotmapController} id="hotmap-right">
            <i
              aria-hidden="true"
              className="fa fa-angle-right"
            />
          </div>
        </div>
        {this.renderCardGroup()}
      </div>
    );
  }
}

Hotmap.defaultProps = {
  className: '',
  login: '',
  renderCards: true,
};

export default Hotmap;
