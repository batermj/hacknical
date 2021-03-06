/* eslint no-new: "off" */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Clipboard from 'clipboard';
import { IconButton, Input, PortalModal } from 'light-ui';
import locales from 'LOCALES';
import { GREEN_COLORS, MD_COLORS } from 'UTILS/colors';
import styles from './share_modal.css';
import message from 'SHARED/utils/message';

const modalTexts = locales('shareModal');
const DARK_COLORS = MD_COLORS.slice(-2);

class ShareModal extends React.Component {
  componentDidMount() {
    this.renderQrcode();
    this.renderClipboard();
  }

  componentDidUpdate(preProps) {
    const { options } = this.props;
    const preOptions = preProps.options;
    if (
      (!options.openShare && preOptions.openShare)
      || (options.openShare && !preOptions.openShare)
    ) {
      this.renderQrcode();
    }
  }

  componentWillUnmount() {
    this.clipboard && this.clipboard.destroy();
  }

  renderClipboard() {
    this.clipboard = new Clipboard('#copyButton', {
      text: () => $('#shareUrl').val()
    });
    this.clipboard.on('success', () => {
      message.notice(modalTexts.notice.copy, 1800);
    });
    this.clipboard.on('error', () => {
      message.error(modalTexts.error.copy, 1800);
    });
  }

  renderQrcode() {
    if (!this.qrcode) return;
    const { options } = this.props;
    const colorDark = options.openShare ? GREEN_COLORS[1] : DARK_COLORS[1];
    this.qrcode.innerHTML = '';
    this.qrcode && new QRCode(this.qrcode, {
      colorDark,
      width: 120,
      height: 120,
      text: options.link,
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  render() {
    const { openModal, onClose, options } = this.props;
    const { link, openShare, text } = options;
    const modalClass = cx(
      styles.share_modal_container,
      !openShare && styles.disabled
    );
    const statusText = openShare ? modalTexts.openTitle : modalTexts.closeTitle;
    const statusClass = cx(
      styles.share_status,
      !openShare && styles.not_open
    );

    return (
      <PortalModal
        showModal={openModal}
        onClose={onClose}
      >
        <div className={modalClass}>
          <div className={styles.share_qrcode}>
            <div ref={ref => (this.qrcode = ref)} />
          </div>
          <div className={styles.share_info}>
            <div className={styles.share_controller}>
              <div className={statusClass}>{statusText}</div>
            </div>
            <blockquote>{modalTexts.text}<br />{text}</blockquote>
            <div className={styles.share_container}>
              <Input
                id="shareUrl"
                theme="flat"
                value={link}
              />
              <IconButton
                color="gray"
                icon="clipboard"
                id="copyButton"
              />
            </div>
          </div>
        </div>
      </PortalModal>
    )
  }
}

ShareModal.propTypes = {
  openModal: PropTypes.bool,
  options: PropTypes.object,
  onClose: PropTypes.func,
};

ShareModal.defaultProps = {
  openModal: false,
  options: {
    openShare: true,
    link: '',
    text: ''
  },
  onClose: () => {},
}

export default ShareModal;
