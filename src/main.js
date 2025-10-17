import baseCss from '../styles/base.css';
import themeDefaultCss from '../styles/theme-default.css';
import themeLightCss from '../styles/theme-light.css';
import themeMidnightCss from '../styles/theme-midnight.css';
import themeAuroraCss from '../styles/theme-aurora.css';
import themeSunriseCss from '../styles/theme-sunrise.css';

const styleElement = document.createElement('style');
styleElement.setAttribute('data-app-bundle', 'styles');
styleElement.textContent = [
    baseCss,
    themeDefaultCss,
    themeLightCss,
    themeMidnightCss,
    themeAuroraCss,
    themeSunriseCss
].join('\n');

document.head.appendChild(styleElement);

import './app.js';
