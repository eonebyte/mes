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

// Define prop types for ChannelItem
ChannelItem.propTypes = {
  channel: PropTypes.shape({
    position: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      // Add other position properties based on what ChannelBox expects
    }).isRequired,
    logo: PropTypes.string.isRequired,  // Assuming logo is a URL string
  }).isRequired,
};
