export default `
*,
*::before,
*::after {
  box-sizing: border-box;
}

*:focus-visible {
  outline: var(--focus-outline-color, black) var(--focus-outline-size, 1px) var(--focus-outline-style, solid);
  outline-offset: var(--focus-outline-offset, 2px);
}

@media (prefers-reduced-motion: no-preference) {
  :is(:root, :host) {
    scroll-behavior: smooth;
  }
}

body {
  background-color: var(--body-bg-color);
  color: var(--body-fg-color);
  font-family: var(--body-font-family);
  font-size: var(--body-font-size);
  font-weight: var(--body-font-weight);
  line-height: var(--body-line-height);
  margin: 0;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

header, 
footer, 
main, 
nav, 
section, 
article, 
aside {
  container-type: inline-size;
}

hr {
  margin: 1rem 0;
  color: inherit;
  border: 0;
  border-top: var(--border-size, 1px) var(--border-style, solid) var(--border-color);
  opacity: 0.25;
}

h6,
h5,
h4,
h3,
h2,
h1 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-family: var(--heading-font-family);
  font-weight: var(--heading-font-weight, 500);
  line-height: var(--heading-line-height, 1.2);
  color: var(--heading-fg-color);
  text-wrap: balance;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}

p,
li,
figcaption {
  text-wrap: pretty;
}

abbr[title] {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
  cursor: help;
  -webkit-text-decoration-skip-ink: none;
  text-decoration-skip-ink: none;
}

address {
  margin-bottom: 1rem;
  font-style: normal;
  line-height: inherit;
}

ol,
ul {
  padding-left: 2rem;
}

ol,
ul,
dl {
  margin-top: 0;
  margin-bottom: 1rem;
}

ol ol,
ul ul,
ol ul,
ul ol {
  margin-bottom: 0;
}

dt {
  font-weight: 700;
}

dd {
  margin-bottom: 0.5rem;
  margin-left: 0;
}

blockquote {
  margin: 0 0 1rem;
}

b,
strong {
  font-weight: bolder;
}

small {
  font-size: 0.875em;
}

mark {
  padding: 0.1875em;
}

sub,
sup {
  position: relative;
  font-size: 0.75em;
  line-height: 0;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

a {
  color: var(--link-fg-color);
  text-decoration: var(--link-decoration);
}
a:hover {
  color: var(--link-hover-fg-color, var(--link-fg-color));
  text-decoration: var(--link-hover-decoration, var(--link-decoration));
}
a:focus-visible {
  color: var(--link-hover-fg-color, var(--link-fg-color));
  text-decoration: var(--link-hover-decoration, var(--link-decoration));
}
a:active {
  color: var(--link-active-fg-color, var(--link-fg-color));
  text-decoration: var(--link-active-decoration, var(--link-decoration));
}
a:visited {
  color: var(--link-visited-fg-color, var(--link-fg-color));
  text-decoration: var(--link-visited-decoration, var(--link-decoration));
}

a:not([href]):not([class]),
a:not([href]):not([class]):hover {
  color: inherit;
  text-decoration: none;
}

pre,
code,
kbd,
samp {
  font-size: 1em;
}

pre {
  display: block;
  margin-top: 0;
  margin-bottom: 1rem;
  overflow: auto;
  font-size: 0.875em;
}
pre code {
  font-size: inherit;
  color: inherit;
  word-break: normal;
}

code {
  font-size: 0.875em;
  word-wrap: break-word;
}
a > code {
  color: inherit;
}

kbd {
  padding: 0.1875rem 0.375rem;
  font-size: 0.875em;
  color: var(--body-bg-color);
  background-color: var(--body-fg-color);
  border-radius: 0.25rem;
}
kbd kbd {
  padding: 0;
  font-size: 1em;
}

figure {
  margin: 0 0 1rem;
}

img,
svg {
  vertical-align: middle;
}

table {
  caption-side: bottom;
  border-collapse: collapse;
}

caption {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: left;
}

th {
  text-align: inherit;
  text-align: -webkit-match-parent;
}

thead,
tbody,
tfoot,
tr,
td,
th {
  border-color: inherit;
  border-style: solid;
  border-width: 0;
}

label {
  display: inline-block;
}

button {
  background-color: var(--button-bg-color);
  border: var(--button-border-color) var(--button-border-style) var(--button-border-size);
  border-radius: var(--button-border-radius);
  color: var(--button-fg-color);
  font-weight: var(--button-font-weight);
  padding: var(--button-padding-y) var(--button-padding-x);
  box-shadow: var(--button-shadow);
  margin: 0;
}

button:focus:not(:focus-visible) {
  outline: 0;
}

button:active {
  background-color: var(--button-active-bg-color);
  border-color: var(--button-active-border-color);
  color: var(--button-active-fg-color);
  box-shadow: var(--button-active-shadow);
}

button:disabled {
  background-color: var(--button-active-bg-color);
  border-color: var(--button-active-border-color);
  color: var(--button-active-fg-color);
  box-shadow: var(--button-active-shadow);
  cursor: not-allowed;
}

button:focus-visible {
  background-color: var(--button-focus-bg-color);
  border-color: var(--button-focus-border-color);
  color: var(--button-focus-fg-color);
  box-shadow: var(--button-focus-shadow);
}

button:hover {
  background-color: var(--button-hover-bg-color);
  border-color: var(--button-hover-border-color);
  color: var(--button-hover-fg-color);
  box-shadow: var(--button-hover-shadow);
}

form {
  border: var(--form-border-color) var(--form-border-size) var(--form-border-style);
  border-radius: var(--form-border-radius);
  background-color: var(--form-bg-color);
  display: flex;
  flex-direction: column;
  gap: var(--form-content-gap, 16px);
  padding: var(--form-padding-y) var(--form-padding-x);
}

input,
select,
textarea {
  background-color: var(--form-control-bg-color);
  border: var(--form-control-border-color) var(--form-control-border-size) var(--form-control-border-style);
  border-radius: var(--form-control-border-radius);
  color: var(--form-control-fg-color);
  font-family: inherit;
  font-size: var(--form-control-font-size);
  height: var(--form-control-input-height);
  line-height: inherit;
  padding: var(--form-control-padding-y) var(--form-control-padding-x);
  margin: 0;
  shadow: var(--form-control-shadow);
}

input::placeholder,
select::placeholder,
textarea::placeholder {
  color: var(--form-control-placeholder-color);
}

input:disabled,
select:disabled,
textarea:disabled {
  background-color: var(--form-control-disabled-bg-color);
  border-color: var(--form-control-disabled-border-color);
  color: var(--form-control-disabled-fg-color);
  opacity: var(--form-control-disabled-opacity);
  shadow: var(--form-control-disabled-shadow);
}

input:disabled::placeholder,
select:disabled::placeholder,
textarea:disabled::placeholder {
  color: var(--form-control-disabled-placeholder-color);
}

input:invalid,
select:invalid,
textarea:invalid {
  background-color: var(--form-control-invalid-bg-color);
  border: var(--form-control-invalid-border-color);
  color: var(--form-control-invalid-fg-color);
  shadow: var(--form-control-invalid-shadow);
}

input:invalid::placeholder,
select:invalid::placeholder,
textarea:invalid::placeholder {
  color: var(--form-control-invalid-placeholder-color);
}

input:focus,
select:focus,
textarea:focus {
  background-color: var(--form-control-focus-bg-color);
  border: var(--form-control-focus-border-color);
  color: var(--form-control-focus-fg-color);
  shadow: var(--form-control-focus-shadow);
}

input:hover,
select:hover,
textarea:hover {
  background-color: var(--form-control-hover-bg-color);
  border: var(--form-control-hover-border-color);
  color: var(--form-control-hover-fg-color);
  shadow: var(--form-control-hover-shadow);
}

label {
  color: var(--form-control-label-fg-color);
  font-size: var(--form-control-label-font-size);
  font-weight: var(--form-control-label-font-weight);
}

button,
select {
  text-transform: none;
}

[role='button'] {
  cursor: pointer;
}

select {
  word-wrap: normal;
}
select:disabled {
  opacity: 1;
}

[list]:not([type='date']):not([type='datetime-local']):not([type='month']):not([type='week']):not(
    [type='time']
  )::-webkit-calendar-picker-indicator {
  display: none !important;
}

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
}
button:not(:disabled),
[type='button']:not(:disabled),
[type='reset']:not(:disabled),
[type='submit']:not(:disabled) {
  cursor: pointer;
}

::-moz-focus-inner {
  padding: 0;
  border-style: none;
}

textarea {
  resize: vertical;
}

fieldset {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}

legend {
  float: left;
  width: 100%;
  padding: 0;
  margin-bottom: 0.5rem;
  font-size: calc(1.275rem + 0.3vw);
  line-height: inherit;
}

legend + * {
  clear: left;
}

::-webkit-datetime-edit-fields-wrapper,
::-webkit-datetime-edit-text,
::-webkit-datetime-edit-minute,
::-webkit-datetime-edit-hour-field,
::-webkit-datetime-edit-day-field,
::-webkit-datetime-edit-month-field,
::-webkit-datetime-edit-year-field {
  padding: 0;
}

::-webkit-inner-spin-button {
  height: auto;
}

[type='search'] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-color-swatch-wrapper {
  padding: 0;
}

::-webkit-file-upload-button {
  font: inherit;
  -webkit-appearance: button;
}

::file-selector-button {
  font: inherit;
  -webkit-appearance: button;
}

output {
  display: inline-block;
}

iframe {
  border: 0;
}

summary {
  display: list-item;
  cursor: pointer;
}

progress {
  vertical-align: baseline;
}

[hidden] {
  display: none !important;
}

@media screen and (forced-colors: active) {
  * {
    --outline-color: Highlight;

    --link-fg-color: LinkText;
    --link-hover-fg-color: LinkText;
    --link-active-fg-color: LinkText;
    --link-visited-fg-color: VisitedText;

    --button-bg-color: ButtonFace;
    --button-fg-color: ButtonText;
    --button-border-color: ButtonText;
    --button-disabled-bg-color: ButtonFace;
    --button-disabled-fg-color: GrayText;
    --button-disabled-border-color: GrayText;

    --form-control-fg-color: GrayText;
    --form-control-border-color: GrayText;
  }

  input:disabled,
  select:disabled,
  textarea:disabled {
    --form-control-disabled-border-color: GrayText;
    --form-control-disabled-fg-color: GrayText;
  }

  *::placeholder {
    color: GrayText;
  }
}
`;
