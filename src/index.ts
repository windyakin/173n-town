import * as Puppeteer from 'puppeteer';
import Axios from 'axios';
import { jsxslack } from 'jsx-slack';

const WEBSITE_URL: string = Buffer.from('aHR0cHM6Ly9mYy5pbmFtaW50b3duLmpwL3MvbjE2MS9wYWdlL29taWt1amk=', 'base64').toString();
const NAVIGATION_WAITING_OPTIONS: Puppeteer.WaitForOptions = { waitUntil: 'networkidle0' };

(async() => {
  const browser = await Puppeteer.launch({
    executablePath: process.env.CHROME_EXECUTABLE_PATH,
  });
  const page = await browser.newPage();
  page.emulate({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
    viewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  });
  try {
    await Promise.all([
      page.goto(WEBSITE_URL),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    await Promise.all([
      (await page.$('a.p-kuji_enter_data')).click(),
      page.waitForNavigation(NAVIGATION_WAITING_OPTIONS),
    ]);
    await Promise.all([
      (await page.$('button.CpBaseBtn')).click(),
      page.waitForNavigation(NAVIGATION_WAITING_OPTIONS),
    ]);
    await (await page.$('input[name="idpwLgid"]')).type(process.env.TOWN_USER);
    await (await page.$('input[name="idpwLgpw"]')).type(process.env.TOWN_PASS);
    await Promise.all([
      (await page.$('button.CpBaseBtn[type="submit"]')).click(),
      page.waitForNavigation(NAVIGATION_WAITING_OPTIONS),
    ]);
    await Promise.all([
      (await page.$('button.CpBaseBtn[type="submit"]')).click(),
      page.waitForNavigation(NAVIGATION_WAITING_OPTIONS),
    ]);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 10000);
    });
    const gotPointText: string = await (await (await page.$('div.p-kuji_result__get-text')).getProperty('textContent')).jsonValue();
    await Promise.all([
      (await page.$('a.p-kuji_result_btn__text')).click(),
      page.waitForNavigation(NAVIGATION_WAITING_OPTIONS),
    ]);
    const hasPointText: string = await (await (await page.$('div.p-room__point-text')).getProperty('textContent')).jsonValue();
    const hasPoints = hasPointText.replace(/^現在 (\d+)ポイント$/, "$1") || '--';

    await Axios.post(
      process.env.SLACK_WEBHOOK_URL,
      {
        text: '今日のポイントを回収したよ',
        blocks: jsxslack`
          <Section>
            <p>:shinto_shrine: 今日のおみくじを引いてポイントを回収したよ</p>
          </Section>
          <Divider />
          <Section>
            <Field>
              <b>今日の獲得ポイント</b><br />
              ${gotPointText}
            </Field>
            <Field>
              <b>これまでの総ポイント</b><br />
              ${hasPoints} pt
            </Field>
          </Section>
          <Divider />
          <Context>
            <Mrkdwn>Powered by 173n-town</Mrkdwn>
          </Context>
        `
      }
    );
  } catch (err) {
    console.log(err);
  } finally {
    await page.close();
    await browser.close();
  }

})();
