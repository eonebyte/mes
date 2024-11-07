import { ChannelBox, ChannelLogo } from "planby";
import PropTypes from 'prop-types';

export const ChannelItem = ({ channel }) => {
  const { position, logo } = channel;
  return (
    <ChannelBox {...position}>
      {/* Overwrite styles by adding eg. style={{ maxHeight: 52, maxWidth: 52,... }} */}
      {/* Or stay with default styles */}
      <ChannelLogo
        src={logo}
        alt="Logo"
        style={{ maxHeight: 52, maxWidth: 52 }}
      />
    </ChannelBox>
  );
};

// Define prop types for runtime validation
ChannelItem.propTypes = {
  channel: PropTypes.shape({
    position: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
      right: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired
    }).isRequired,
    logo: PropTypes.string.isRequired
  }).isRequired
};
