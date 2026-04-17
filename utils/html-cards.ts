function escapeHtml(text: unknown): string {
  const raw = String(text ?? "");
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeNumber(value: unknown, fallback: string = "--"): string {
  if (value == null || value === "") {
    return fallback;
  }
  return String(value);
}

function isNightNow(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

function pickWeatherEmoji(condition: string): string {
  const text = String(condition || "");
  if (/雷|暴雨|阵雨|雨/.test(text)) return "🌧️";
  if (/雪|冰|霜/.test(text)) return "❄️";
  if (/雾|霾|沙|浮尘/.test(text)) return "🌫️";
  if (/阴|多云|云/.test(text)) return "☁️";
  if (/晴|少云|clear|sun/i.test(text)) return "☀️";
  return "🌤️";
}

function pickWeatherTheme(
  condition: string,
  isNight: boolean,
): {
  pageBg: string;
  overlay: string;
  glass: string;
  glassBorder: string;
  shadow: string;
  text: string;
  weakText: string;
  alertBg: string;
} {
  const text = String(condition || "");
  const isRain = /雷|暴雨|阵雨|雨/.test(text);
  const isSnow = /雪|冰|霜/.test(text);
  const isFog = /雾|霾|沙|浮尘/.test(text);
  const isCloudy = /阴|多云|云/.test(text);
  const isSunny = /晴|少云|clear|sun/i.test(text);

  if (isRain) {
    return isNight
      ? {
          pageBg:
            "radial-gradient(circle at 20% 8%, #3f5f9f 0%, #23365f 42%, #101a34 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.3))",
          glass: "rgba(19, 33, 63, 0.44)",
          glassBorder: "rgba(152, 192, 255, 0.28)",
          shadow: "0 20px 48px rgba(6, 12, 31, 0.45)",
          text: "#eaf3ff",
          weakText: "rgba(234,243,255,0.8)",
          alertBg: "rgba(191, 68, 54, 0.34)",
        }
      : {
          pageBg:
            "radial-gradient(circle at 18% 6%, #8bc9ff 0%, #4a86d9 45%, #2d4f9f 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.18))",
          glass: "rgba(255,255,255,0.2)",
          glassBorder: "rgba(255,255,255,0.28)",
          shadow: "0 20px 48px rgba(12, 33, 96, 0.28)",
          text: "#ffffff",
          weakText: "rgba(255,255,255,0.82)",
          alertBg: "rgba(220, 89, 68, 0.28)",
        };
  }

  if (isSnow) {
    return isNight
      ? {
          pageBg:
            "radial-gradient(circle at 20% 10%, #6f84b8 0%, #3f557f 42%, #1f2d4e 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 42%, rgba(0,0,0,0.2))",
          glass: "rgba(32, 44, 74, 0.46)",
          glassBorder: "rgba(189, 219, 255, 0.28)",
          shadow: "0 20px 48px rgba(8, 16, 40, 0.35)",
          text: "#f2f7ff",
          weakText: "rgba(242,247,255,0.8)",
          alertBg: "rgba(200, 117, 85, 0.28)",
        }
      : {
          pageBg:
            "radial-gradient(circle at 18% 6%, #dff3ff 0%, #a8d8ff 40%, #6ca8ea 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.1))",
          glass: "rgba(255,255,255,0.26)",
          glassBorder: "rgba(255,255,255,0.35)",
          shadow: "0 20px 48px rgba(31, 96, 159, 0.22)",
          text: "#ffffff",
          weakText: "rgba(255,255,255,0.86)",
          alertBg: "rgba(190, 112, 82, 0.24)",
        };
  }

  if (isFog) {
    return isNight
      ? {
          pageBg:
            "radial-gradient(circle at 20% 8%, #677489 0%, #495566 40%, #2f3845 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05) 42%, rgba(0,0,0,0.2))",
          glass: "rgba(50, 61, 78, 0.5)",
          glassBorder: "rgba(212, 222, 235, 0.25)",
          shadow: "0 20px 48px rgba(16, 20, 30, 0.34)",
          text: "#f3f6fb",
          weakText: "rgba(243,246,251,0.78)",
          alertBg: "rgba(189, 107, 82, 0.26)",
        }
      : {
          pageBg:
            "radial-gradient(circle at 20% 8%, #dce6ee 0%, #b9c8d5 40%, #8ea2b6 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.1))",
          glass: "rgba(255,255,255,0.26)",
          glassBorder: "rgba(255,255,255,0.34)",
          shadow: "0 20px 48px rgba(53, 73, 98, 0.24)",
          text: "#ffffff",
          weakText: "rgba(255,255,255,0.82)",
          alertBg: "rgba(200, 108, 72, 0.24)",
        };
  }

  if (isCloudy) {
    return isNight
      ? {
          pageBg:
            "radial-gradient(circle at 20% 8%, #617aa8 0%, #3d5482 42%, #24385f 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 42%, rgba(0,0,0,0.22))",
          glass: "rgba(30, 48, 83, 0.46)",
          glassBorder: "rgba(165, 197, 255, 0.26)",
          shadow: "0 20px 48px rgba(9, 18, 44, 0.36)",
          text: "#edf3ff",
          weakText: "rgba(237,243,255,0.78)",
          alertBg: "rgba(203, 88, 70, 0.28)",
        }
      : {
          pageBg:
            "radial-gradient(circle at 18% 6%, #a5d3ff 0%, #6aa5e8 42%, #4172c8 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.07) 42%, rgba(0,0,0,0.14))",
          glass: "rgba(255,255,255,0.22)",
          glassBorder: "rgba(255,255,255,0.3)",
          shadow: "0 20px 48px rgba(20, 53, 120, 0.28)",
          text: "#ffffff",
          weakText: "rgba(255,255,255,0.82)",
          alertBg: "rgba(207, 84, 66, 0.26)",
        };
  }

  if (isSunny) {
    return isNight
      ? {
          pageBg:
            "radial-gradient(circle at 22% 10%, #445ea3 0%, #2b3f75 42%, #18244a 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.03) 44%, rgba(0,0,0,0.22))",
          glass: "rgba(28, 43, 80, 0.44)",
          glassBorder: "rgba(159, 188, 255, 0.26)",
          shadow: "0 20px 48px rgba(8, 14, 32, 0.36)",
          text: "#f1f6ff",
          weakText: "rgba(241,246,255,0.78)",
          alertBg: "rgba(204, 90, 66, 0.26)",
        }
      : {
          pageBg:
            "radial-gradient(circle at 16% 8%, #a5e8ff 0%, #5faeff 38%, #2f66df 100%)",
          overlay:
            "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.12))",
          glass: "rgba(255,255,255,0.23)",
          glassBorder: "rgba(255,255,255,0.32)",
          shadow: "0 20px 48px rgba(15, 57, 145, 0.27)",
          text: "#ffffff",
          weakText: "rgba(255,255,255,0.84)",
          alertBg: "rgba(209, 90, 64, 0.24)",
        };
  }

  return isNight
    ? {
        pageBg:
          "radial-gradient(circle at 20% 8%, #5670a8 0%, #354d79 40%, #23345b 100%)",
        overlay:
          "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.2))",
        glass: "rgba(30, 47, 82, 0.44)",
        glassBorder: "rgba(165, 199, 255, 0.26)",
        shadow: "0 20px 48px rgba(8, 14, 36, 0.34)",
        text: "#eef4ff",
        weakText: "rgba(238,244,255,0.8)",
        alertBg: "rgba(204, 89, 67, 0.26)",
      }
    : {
        pageBg:
          "radial-gradient(circle at 15% 10%, #72d4ff 0%, #3f8cff 35%, #2342c9 100%)",
        overlay:
          "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.16))",
        glass: "rgba(255,255,255,0.17)",
        glassBorder: "rgba(255,255,255,0.22)",
        shadow: "0 20px 48px rgba(5, 16, 69, 0.25)",
        text: "#ffffff",
        weakText: "rgba(255,255,255,0.82)",
        alertBg: "rgba(232, 86, 68, 0.24)",
      };
}

function pickAlertDangerPalette(
  alerts: any[],
  isNight: boolean,
): {
  bg: string;
  border: string;
  divider: string;
} {
  return isNight
    ? {
        bg: "rgba(147, 19, 36, 0.48)",
        border: "rgba(255, 121, 140, 0.58)",
        divider: "rgba(255, 148, 162, 0.4)",
      }
    : {
        bg: "rgba(220, 38, 38, 0.34)",
        border: "rgba(254, 202, 202, 0.66)",
        divider: "rgba(254, 202, 202, 0.46)",
      };
}

export function buildWeatherAppHtml(
  data: any,
  query: string,
  forecastData?: any,
): string {
  const night = isNightNow();
  const location = escapeHtml(data?.location?.name || query || "未知地区");
  const conditionRaw = String(data?.weather?.condition || "未知");
  const condition = escapeHtml(conditionRaw);
  const temperature = normalizeNumber(data?.weather?.temperature);
  const humidity = normalizeNumber(data?.weather?.humidity);
  const pressure = normalizeNumber(data?.weather?.pressure);
  const windDirection = escapeHtml(data?.weather?.wind_direction || "--");
  const windPower = escapeHtml(data?.weather?.wind_power || "--");
  const updated = escapeHtml(data?.weather?.updated || "--");
  const weatherIcon = escapeHtml(data?.weather?.weather_icon || "");
  const weatherColors = Array.isArray(data?.weather?.weather_colors)
    ? data.weather.weather_colors
    : null;

  const aqi = normalizeNumber(data?.air_quality?.aqi);
  const quality = escapeHtml(data?.air_quality?.quality || "--");
  const pm25 = normalizeNumber(data?.air_quality?.pm25);
  const pm10 = normalizeNumber(data?.air_quality?.pm10);
  const sunriseData = data?.sunrise || {};
  const sunrise = escapeHtml(sunriseData.sunrise_desc || "--");
  const sunset = escapeHtml(sunriseData.sunset_desc || "--");

  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const alertPalette = pickAlertDangerPalette(alerts, night);

  const alertHtml =
    alerts.length > 0
      ? `
      <div class="alert-card">
        ${alerts
          .slice(0, 2)
          .map((item: any) => {
            const title = escapeHtml(
              `${item?.type || ""}${item?.level || ""}`.trim() || "天气预警",
            );
            const detail = escapeHtml(item?.detail || "请注意防范天气风险");
            return `<div class="alert-item"><h4>${title}</h4><p>${detail}</p></div>`;
          })
          .join("")}
      </div>`
      : "";

  const hourlyForecasts = Array.isArray(forecastData?.hourly_forecast)
    ? forecastData.hourly_forecast.slice(0, 8)
    : [];

  const bgColor1 =
    weatherColors && weatherColors[0]
      ? weatherColors[0]
      : night
        ? "#2d3a5c"
        : "#6ba7de";
  const bgColor2 =
    weatherColors && weatherColors[1]
      ? weatherColors[1]
      : night
        ? "#1a2540"
        : "#4a8bc7";
  const bgColor3 =
    weatherColors && weatherColors[2]
      ? weatherColors[2]
      : night
        ? "#0f1a2e"
        : "#3a7bc8";

  const pageBg = `linear-gradient(165deg, ${bgColor1} 0%, ${bgColor2} 50%, ${bgColor3} 100%)`;
  const textColor = night ? "#ffffff" : "#ffffff";
  const weakTextColor = night
    ? "rgba(255,255,255,0.75)"
    : "rgba(255,255,255,0.85)";
  const cardBg = night ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)";
  const cardBorder = night ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)";
  const cardShadow = night
    ? "0 12px 40px rgba(0,0,0,0.3)"
    : "0 12px 40px rgba(0,0,0,0.15)";

  const sunriseIcon = night ? "🌙" : "🌅";
  const windIcon =
    windPower.includes("3") ||
    windPower.includes("4") ||
    windPower.includes("5") ||
    windPower.includes("6")
      ? "💨"
      : "🍃";

  return `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      width: 100%;
      min-height: 100vh;
      background: ${pageBg};
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: ${textColor};
      line-height: 1.4;
      padding: 32px 24px;
      min-height: 100vh;
    }
    .weather-app {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }
    .main-card {
      background: ${cardBg};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid ${cardBorder};
      border-radius: 32px;
      padding: 28px 24px;
      box-shadow: ${cardShadow};
    }
    .location-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .location-icon {
      font-size: 20px;
    }
    .location {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .current-weather {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-top: 16px;
      gap: 16px;
    }
    .temp-block {
      flex: 1;
    }
    .temp {
      font-size: 80px;
      font-weight: 200;
      line-height: 1;
      letter-spacing: -3px;
    }
    .temp-unit {
      font-size: 36px;
      font-weight: 300;
      vertical-align: super;
    }
    .condition {
      font-size: 18px;
      margin-top: 6px;
      opacity: 0.9;
    }
    .condition-text {
      font-weight: 500;
    }
    .icon-block {
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .weather-icon-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .update-time {
      font-size: 13px;
      margin-top: 12px;
      opacity: 0.7;
    }
    .divider {
      height: 1px;
      background: ${cardBorder};
      margin: 20px 0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .metric-card {
      background: ${cardBg};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid ${cardBorder};
      border-radius: 20px;
      padding: 14px 16px;
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .metric-icon {
      font-size: 16px;
    }
    .metric-label {
      font-size: 13px;
      opacity: 0.8;
    }
    .metric-value {
      font-size: 22px;
      font-weight: 600;
    }
    .metric-sub {
      font-size: 12px;
      opacity: 0.7;
      margin-top: 2px;
    }
    .metric-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .metric-unit {
      font-size: 14px;
      opacity: 0.8;
    }
    .sun-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .sun-time {
      font-size: 15px;
      font-weight: 500;
    }
    .forecast-section {
      margin-top: 20px;
    }
    .forecast-title {
      font-size: 15px;
      font-weight: 600;
      opacity: 0.9;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hourly-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: ${cardBg};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid ${cardBorder};
      border-radius: 20px;
      padding: 16px 12px;
    }
    .hourly-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    .hourly-time {
      font-size: 12px;
      opacity: 0.8;
      font-weight: 500;
    }
    .hourly-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hourly-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .hourly-icon .forecast-icon-emoji,
    .forecast-icon-emoji {
      font-size: 16px;
    }
    .hourly-temp {
      font-size: 14px;
      font-weight: 600;
    }
    .alert-card {
      margin-top: 16px;
      background: ${alertPalette.bg};
      border: 1px solid ${alertPalette.border};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 14px 16px;
    }
    .alert-item + .alert-item {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid ${alertPalette.divider};
    }
    .alert-item h4 {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .alert-item p {
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.95;
      margin: 0;
    }
  </style>
  <div class="weather-app">
    <div class="main-card">
      <div class="location-row">
        <span class="location">${location}</span>
      </div>
      <div class="current-weather">
        <div class="temp-block">
          <div class="temp">${temperature}<span class="temp-unit">°</span></div>
          <div class="condition">
            <span class="condition-text">${condition}</span>
          </div>
          <div class="update-time">更新于 ${updated}</div>
        </div>
        <div class="icon-block">
          ${
            weatherIcon
              ? `<img class="weather-icon-img" src="${weatherIcon}" alt="${condition}" onerror="this.style.display='none'">`
              : ""
          }
        </div>
      </div>

      <div class="divider"></div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">💧</span>
            <span class="metric-label">湿度</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${humidity}</span>
            <span class="metric-unit">%</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🌡️</span>
            <span class="metric-label">气压</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pressure}</span>
            <span class="metric-unit">hPa</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">${windIcon}</span>
            <span class="metric-label">${windDirection}</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${windPower}</span>
            <span class="metric-unit">级</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🫧</span>
            <span class="metric-label">PM2.5</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pm25}</span>
          </div>
          <div class="metric-sub">AQI ${aqi} · ${quality}</div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🌅</span>
            <span class="metric-label">日出</span>
          </div>
          <div class="sun-row">
            <span class="sun-time">${sunrise}</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🌇</span>
            <span class="metric-label">日落</span>
          </div>
          <div class="sun-row">
            <span class="sun-time">${sunset}</span>
          </div>
        </div>
      </div>

      ${alertHtml}

      ${
        hourlyForecasts.length > 0
          ? `
      <div class="forecast-section">
        <div class="forecast-title">
          <span>🕐</span>
          <span>天气预报</span>
        </div>
        <div class="hourly-row">
          ${hourlyForecasts
            .map((item: any, index: number) => {
              const hourStr =
                item?.datetime?.split(" ")[1]?.substring(0, 5) || "--";
              const hourNum = parseInt(hourStr.split(":")[0], 10);
              const timeLabel =
                index === 0
                  ? "现在"
                  : `${isNaN(hourNum) ? hourStr : hourNum}时`;
              const temp = normalizeNumber(item?.temperature);
              const cond = escapeHtml(item?.condition || "--");
              const iconUrl = escapeHtml(item?.weather_icon || "");
              const condEmoji = pickWeatherEmoji(String(item?.condition || ""));
              return `
              <div class="hourly-col">
                <div class="hourly-time">${timeLabel}</div>
                <div class="hourly-icon">
                  ${
                    iconUrl
                      ? `<img src="${iconUrl}" alt="${cond}" onerror="this.parentElement.innerHTML='<span class=forecast-icon-emoji>${condEmoji}</span>'">`
                      : `<span class="forecast-icon-emoji">${condEmoji}</span>`
                  }
                </div>
                <div class="hourly-temp">${temp}°</div>
              </div>`;
            })
            .join("")}
        </div>
      </div>
      `
          : ""
      }
    </div>
  </div>
  `;
}

export function buildMoyuDailyHtml(data: any): string {
  const night = isNightNow();
  const gregorian = escapeHtml(data?.date?.gregorian || "--");
  const weekday = escapeHtml(data?.date?.weekday || "");
  const weekProgress = normalizeNumber(data?.progress?.week?.percentage, "0");
  const monthProgress = normalizeNumber(data?.progress?.month?.percentage, "0");
  const yearProgress = normalizeNumber(data?.progress?.year?.percentage, "0");
  const toWeekend = normalizeNumber(data?.countdown?.toWeekEnd, "--");
  const toMonthEnd = normalizeNumber(data?.countdown?.toMonthEnd, "--");
  const toYearEnd = normalizeNumber(data?.countdown?.toYearEnd, "--");
  const quote = escapeHtml(data?.moyuQuote || "今天也要高效摸鱼，专注保命。");
  const holidayName = escapeHtml(data?.nextHoliday?.name || "--");
  const holidayDate = escapeHtml(data?.nextHoliday?.date || "--");
  const holidayUntil = normalizeNumber(data?.nextHoliday?.until, "--");
  const theme = night
    ? {
        pageBg:
          "linear-gradient(165deg, #121826 0%, #1e293b 45%, #334155 100%)",
        text: "#e5ecff",
        weakText: "rgba(229,236,255,0.8)",
        cardBg: "rgba(17, 25, 40, 0.74)",
        cardBorder: "rgba(148, 163, 184, 0.28)",
        shadow: "0 18px 44px rgba(2, 6, 23, 0.46)",
        strong: "#f8fafc",
        strongAccent: "#c4b5fd",
        quoteBg: "rgba(30, 41, 59, 0.9)",
        quoteColor: "#dbeafe",
        quoteBorder: "#8b5cf6",
        track: "rgba(148,163,184,0.22)",
        divider: "rgba(148,163,184,0.24)",
      }
    : {
        pageBg:
          "linear-gradient(160deg, #fff7ed 0%, #ffedd5 38%, #fed7aa 100%)",
        text: "#3b1a00",
        weakText: "rgba(59,26,0,0.78)",
        cardBg: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(255,255,255,0.88)",
        shadow: "0 18px 44px rgba(120, 53, 15, 0.14)",
        strong: "#3b1a00",
        strongAccent: "#9a3412",
        quoteBg: "rgba(255, 247, 237, 0.95)",
        quoteColor: "#7c2d12",
        quoteBorder: "#f97316",
        track: "rgba(180,83,9,0.16)",
        divider: "rgba(180, 83, 9, 0.24)",
      };

  const buildProgress = (
    label: string,
    value: string,
    color: string,
  ): string => `
    <div class="progress-item">
      <div class="progress-top">
        <span>${label}</span>
        <strong>${value}%</strong>
      </div>
      <div class="progress-track">
        <div class="progress-inner" style="width:${value}%;background:${color};"></div>
      </div>
    </div>
  `;

  return `
  <style>
    body {
      margin: 0;
      background: ${theme.pageBg};
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: ${theme.text};
    }
    .moyu-page {
      width: 760px;
      padding: 24px;
      box-sizing: border-box;
      position: relative;
      display: inline-block;
    }
    .title-card {
      border-radius: 28px;
      padding: 22px;
      background: ${theme.cardBg};
      border: 1px solid ${theme.cardBorder};
      box-shadow: ${theme.shadow};
      margin-bottom: 16px;
    }
    .title {
      font-size: 40px;
      font-weight: 700;
      line-height: 1.1;
    }
    .subtitle {
      margin-top: 8px;
      font-size: 20px;
      color: ${theme.weakText};
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .card {
      border-radius: 22px;
      padding: 16px;
      background: ${theme.cardBg};
      border: 1px solid ${theme.cardBorder};
      box-shadow: ${theme.shadow};
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .kv {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      padding: 6px 0;
      border-bottom: 1px dashed ${theme.divider};
    }
    .kv:last-child {
      border-bottom: none;
    }
    .kv strong {
      font-size: 24px;
      color: ${theme.strongAccent};
    }
    .progress-item + .progress-item {
      margin-top: 12px;
    }
    .progress-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 16px;
      margin-bottom: 6px;
    }
    .progress-top strong {
      font-size: 20px;
      color: ${theme.strongAccent};
    }
    .progress-track {
      height: 10px;
      border-radius: 999px;
      background: ${theme.track};
      overflow: hidden;
    }
    .progress-inner {
      height: 100%;
      border-radius: 999px;
      min-width: 8px;
    }
    .quote {
      margin-top: 14px;
      border-radius: 20px;
      background: ${theme.quoteBg};
      border-left: 5px solid ${theme.quoteBorder};
      padding: 14px;
      font-size: 20px;
      line-height: 1.6;
      color: ${theme.quoteColor};
    }
  </style>
  <div class="moyu-page">
    <div class="title-card">
      <div class="title">摸鱼日报</div>
      <div class="subtitle">${gregorian} ${weekday}</div>
    </div>
    <div class="grid">
      <div class="card">
        <div class="card-title">今日倒计时</div>
        <div class="kv"><span>距离周末</span><strong>${toWeekend} 天</strong></div>
        <div class="kv"><span>距离月底</span><strong>${toMonthEnd} 天</strong></div>
        <div class="kv"><span>距离年底</span><strong>${toYearEnd} 天</strong></div>
      </div>
      <div class="card">
        <div class="card-title">进度条</div>
        ${buildProgress("本周进度", weekProgress, "linear-gradient(90deg,#f97316,#fb7185)")}
        ${buildProgress("本月进度", monthProgress, "linear-gradient(90deg,#0ea5e9,#22d3ee)")}
        ${buildProgress("全年进度", yearProgress, "linear-gradient(90deg,#22c55e,#84cc16)")}
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <div class="card-title">下个假期</div>
      <div class="kv"><span>节日</span><strong>${holidayName}</strong></div>
      <div class="kv"><span>日期</span><strong>${holidayDate}</strong></div>
      <div class="kv"><span>还有</span><strong>${holidayUntil} 天</strong></div>
      <div class="quote">${quote}</div>
    </div>
  </div>
  `;
}
