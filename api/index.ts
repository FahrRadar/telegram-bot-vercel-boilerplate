import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = '@FahrRadarGratis';
const WEATHER_API_KEY = 'a6312628444ccec4f1cc4d0f97eace3d';
const REGIONS = ['Zurich', 'Bern', 'Basel', 'Geneva', 'Lausanne'];

const getWeatherWarnings = async () => {
  const results = await Promise.all(
    REGIONS.map(async (city) => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},CH&appid=${WEATHER_API_KEY}&units=metric&lang=de`);
      const data = await res.json();
      const desc = data.weather?.[0]?.description || 'Keine Daten';
      const temp = data.main?.temp || '-';
      return `📍 *${city}*: ${desc}, ${temp}°C`;
    })
  );
  return results.join('\n');
};

const generateMessage = async () => {
  const date = new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' });
  const weatherText = await getWeatherWarnings();
  return `📍 *FahrRadar Update – ${date}*\n\n🚨 *Radar & Polizei (Beispiel)*\n• Zürich: A1 – mobiler Blitzer bei Wallisellen\n• Bern: Tempokontrolle Wankdorf\n\n🌧️ *Wetterwarnung:*\n${weatherText}\n\n🩺 *Tages-Gesundheitstipp:*\nKälteeinbruch kann Kreislauf & Blutdruck belasten – warm anziehen, ruhig planen.\n\n🔁 Nächstes Update in 2 Stunden.`;
};

const postToTelegram = async () => {
  const msg = await generateMessage();
  await bot.telegram.sendMessage(CHANNEL_ID, msg, { parse_mode: 'Markdown' });
};

export default async function handler(req, res) {
  await postToTelegram();
  res.status(200).send('Nachricht gesendet ✅');
}
