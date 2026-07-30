import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    overflow: hidden;
    position: relative;
  }

  .skeleton {
    animation: var(--skeleton-animation);
    background: ${component('skeleton', 'bgColor')};
    border-radius: var(--skeleton-border-radius);
    border: 1px solid transparent;
    display: flex;
    height: 100%;
    min-height: ${component('skeleton', 'minHeight')};
    width: ${component('skeleton', 'width')};
  }

  :host([animation='pulse']) .skeleton,
  :host([animation='wave']) .skeleton {
    background-size: ${component('skeleton', 'bgSize')};
    background-image: linear-gradient(
      to right,
      ${component('skeleton', 'bgColor')} 0%,
      ${component('skeleton', 'sheenColor')} 50%,
      ${component('skeleton', 'bgColor')} 100%
    );
  }

  :host([animation='wave']) .skeleton {
    --skeleton-animation: wave 3s linear infinite;
  }

  :host([animation='pulse']) .skeleton {
    --skeleton-animation: pulse 1s linear infinite;
  }

  .skeleton-rect {
    --skeleton-border-radius: ${component('skeleton', 'borderRadius')};
  }

  .skeleton-circle {
    --skeleton-border-radius: 100%;
    overflow: hidden;
  }

  @keyframes wave {
    from {
      background-position: 300% 0%;
    }
    to {
      background-position: 0% 0%;
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  @media screen and (forced-colors: active) {
    .skeleton {
      --skeleton-animation: none !important;
      --skeleton-bg-color: GrayText;
      border-color: GrayText;
    }
  }
`;
