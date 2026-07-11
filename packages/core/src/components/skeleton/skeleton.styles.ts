import { css } from 'lit';
import { project } from '../../utilities/project.js';

const { component } = project.theme;

export default css`
  :host {
    display: block;
    overflow: hidden;
    position: relative;
  }

  .skeleton {
    animation: var(--skeleton-animation);
    background: var(--skeleton-bg-color, hsl(40 4.6% 87.3%));
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
      var(--skeleton-bg-color, hsl(40 4.6% 87.3%)) 0%,
      ${component('skeleton', 'sheenColor')} 50%,
      var(--skeleton-bg-color, hsl(40 4.6% 87.3%)) 100%
    );
  }

  :host([animation='wave']) .skeleton {
    --skeleton-animation: wave 3s linear infinite;
  }

  :host([animation='pulse']) .skeleton {
    --skeleton-animation: pulse 1s linear infinite;
  }

  .skeleton-rect {
    --skeleton-border-radius: var(--border-radius-md, 4px);
  }

  .skeleton-circle {
    --skeleton-border-radius: var(--border-radius-circular, 100%);
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
