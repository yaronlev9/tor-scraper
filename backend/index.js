require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(express.static('build'))
const Paste = require('./models/pastes')
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose')

const keywords = ['guest', 'unknown', 'anonymous']


  
  app.get('/api/pastes', (request, response) => {
      Paste.find().sort({date:-1}).then(pastes => {
        response.json(pastes)
      })
  });


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--proxy-server=socks5://127.0.0.1:9050']
  });
  const page = await browser.newPage();

  await page.goto('http://nzxj65x32vh2fkhk.onion/all');

  const content = await page.content();
  const $ = cheerio.load(content);
  let contents = [];
  getContents($, contents);
  let authors = [];
  let dates = [];
  getAuthors($, authors, dates)
  let titles = [];
  getTitles($, titles)
  browser.close();
  contents = contents.reverse();
  titles = titles.reverse();
  authors = authors.reverse();
  dates = dates.reverse();
  const last = await Paste.find().sort({date:-1}).limit(1).then(res => res[0]);
  let lastDate;
  if (last){
    lastDate = last.date;
  }
  else{
    lastDate = undefined;
  }
  addData(contents, lastDate, dates, authors, titles)
  setTimeout(main, 1200000);
}

function addData(contents, lastDate, dates, authors, titles) {
  for (let i = 0; i < contents.length; i++) {
    if (lastDate === undefined || dates[i] > lastDate) {
      console.log('added new paste to database');
      let author = authors[i]
      if (keywords.includes(authors[i].toLowerCase())) {
        author = ''
      }
      let title = titles[i]
      if (keywords.includes(titles[i].toLowerCase())) {
        title = ''
      }
      const paste = new Paste({
        author: author,
        title: title,
        content: contents[i],
        date: dates[i]
      })
      paste.save()
    }
  }
}

function getTitles($, titles) {
  $('.row').each((idx, elem) => {
    if (idx !== 1 && idx !== 0 && idx % 3 === 0) {
      const paste = $(elem).text()
      let splited = paste.split('\n').join('')
      splited = splited.split('Show')[0]
      splited = splited.split('\t').join('')
      titles.push(splited)
    }
  })
}

function getAuthors($, authors, dates) {
  $('.row').each((idx, elem) => {
    if (idx !== 1 && idx !== 0 && idx % 3 === 1) {
      const paste = $(elem).text()
      let strArr = paste.split('\t')
      for (const str of strArr) {
        if (str.startsWith("Posted")) {
          let splited = str.split(' ')
          authors.push(splited[2])
          let date = new Date(splited[5] + ' ' + splited[4] + ', ' + splited[6].split(',')[0] + ' ' + splited[7])
          dates.push(date)
          break
        }
      }

    }
  })
}

function getContents($, contents) {
  $('.text').each((idx, elem) => {
    const paste = $(elem).text()
    let splited = paste.split('\t').join('')
    splited = splited.split('\n')
    for (let i = 0; i < splited.length; i++) {
      splited[i] = splited[i].trim()
    }
    contents.push(splited.join('\n'))
  })
}

main();
