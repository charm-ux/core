import { css } from 'lit';

export default css`
  :host {
    --skeleton-animation: inherit;
    --skeleton-bg-color: inherit;
    --skeleton-bg-size: inherit;
    --skeleton-border-radius: inherit;
    --skeleton-min-height: inherit;
    --skeleton-sheen-color: inherit;
    --skeleton-Width: inherit;
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
    min-height: var(--skeleton-min-height, 1rem);
    width: var(--skeleton-width, 100%);
  }

  :host([animation='pulse']) .skeleton,
  :host([animation='wave']) .skeleton {
    background-size: var(--skeleton-bg-size, 300% 100%);
    background-image: linear-gradient(
      to right,
      var(--skeleton-bg-color, hsl(40 4.6% 87.3%)) 0%,
      var(--skeleton-sheen-color, #fafafa) 50%,
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
