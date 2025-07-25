const cheerio = require('cheerio');
const fs = require('fs');

function extractData(html) {
  const $ = cheerio.load(html);

  // Helper to get text and clean it
  const getText = (selector) => $(selector).text().replace(/\s+/g, ' ').trim();

  // 1. Title
  const title = $('.js--careerName').first().text().trim() || $('h1.section__heading').first().text().trim();

  // 2. Summary
  const summary = $('.js--career-summary').first().text().replace(/\s+/g, ' ').trim();

  // 3. Career Opportunities (dynamic extraction)
  const careerOpportunities = {};
  $('#professional h3.accordian__heading').each((i, el) => {
    let heading = $(el).find('.career-section__sub-heading').text().replace(/\s+/g, ' ').trim().toLowerCase();
    // Fallback: if .career-section__sub-heading is not present, use the heading text itself
    if (!heading) heading = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase();
    // Clean heading to use as key: replace spaces with underscores, remove non-alphanum/underscore
    const key = heading.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const content = $(el).next('.according__content').find('p').text().replace(/\s+/g, ' ').trim();
    if (key && content) careerOpportunities[key] = content;
  });

  // 4. How to Become (Career Path)
  const howToBecome = {};
  $('#career-path tbody.js--careerPath tr').each((i, el) => {
    const pathName = $(el).find('th .path__heading').text().trim().toLowerCase();
    const tds = $(el).find('td');
    howToBecome[`path ${i + 1}`] = {
      stream: $(tds[0]).text().replace(/\s+/g, ' ').trim(),
      graduation: $(tds[1]).text().replace(/\s+/g, ' ').trim(),
      'after graduation': $(tds[2]).text().replace(/\s+/g, ' ').trim(),
    };
  });

  // 5. Important Facts
  let importantFacts = '';
  $('#important-facts .js--career-facts ul li').each((i, el) => {
    importantFacts += $(el).text().replace(/\s+/g, ' ').trim() + (i > 0 ? ' ' : '');
  });

  // 6. Leading Institutes
  const leadingInstitutes = {};
  $('#leading-colleges tbody.js--leadingInstitute tr').each((i, el) => {
    const tds = $(el).find('td');
    leadingInstitutes[`${i + 1}`] = {
      name: $(tds[0]).text().replace(/\s+/g, ' ').trim(),
      location: $(tds[1]).text().replace(/\s+/g, ' ').trim(),
      website: $(tds[2]).find('a').attr('href') || ''
    };
  });

  // 7. Entrance Exam (extract as array of objects)
  let entranceExam = [];
  $('#entrance-exams tbody tr').each((i, el) => {
    const tds = $(el).find('td');
    if (tds.length >= 4) {
      // Extract website: prefer data-clipboard-text if present, else text
      let website = '';
      const btn = $(tds[3]).find('button[data-clipboard-text]');
      if (btn.length > 0) {
        website = btn.attr('data-clipboard-text').trim();
      } else {
        website = $(tds[3]).text().replace(/\s+/g, ' ').trim();
      }
      entranceExam.push({
        name: $(tds[0]).text().replace(/\s+/g, ' ').trim(),
        date: $(tds[1]).text().replace(/\s+/g, ' ').trim(),
        elements: $(tds[2]).text().replace(/\s+/g, ' ').trim(),
        website
      });
    }
  });

  // 8. Work Description
  const workDescription = [];
  $('#work-description .js--workDescription ul li').each((i, el) => {
    workDescription.push($(el).text().replace(/\s+/g, ' ').trim());
  });

  // 9. Pros and Cons (robust extraction: handle both lists and plain text blocks)
  const pros = [];
  const cons = [];
  $('#pros-cons .col-md-12').each((i, el) => {
    const heading = $(el).find('h3').text().toLowerCase();
    // Try to extract from <ul><li> if present
    if (heading.includes('pros')) {
      const listItems = $(el).find('ul li');
      if (listItems.length > 0) {
        listItems.each((j, li) => pros.push($(li).text().replace(/\s+/g, ' ').trim()));
      } else {
        // Fallback: extract plain text from the first <div> after heading
        const textBlock = $(el).find('div').first().text().replace(/\s+/g, ' ').trim();
        if (textBlock) {
          // Split by line breaks if multiple points, else push as one
          textBlock.split(/\n|\r|\u2028|\u2029/).forEach(line => {
            const clean = line.trim();
            if (clean) pros.push(clean);
          });
          if (pros.length === 0 && textBlock) pros.push(textBlock); // fallback: push all if no split
        }
      }
    }
    if (heading.includes('cons')) {
      const listItems = $(el).find('ul li');
      if (listItems.length > 0) {
        listItems.each((j, li) => cons.push($(li).text().replace(/\s+/g, ' ').trim()));
      } else {
        // Fallback: extract plain text from the first <div> after heading
        const textBlock = $(el).find('div').first().text().replace(/\s+/g, ' ').trim();
        if (textBlock) {
          textBlock.split(/\n|\r|\u2028|\u2029/).forEach(line => {
            const clean = line.trim();
            if (clean) cons.push(clean);
          });
          if (cons.length === 0 && textBlock) cons.push(textBlock);
        }
      }
    }
  });

  return {
    title,
    summary,
    'career-opportunities': careerOpportunities,
    'how to become': howToBecome,
    'Important Facts': importantFacts,
    'leading institutes': leadingInstitutes,
    'entrance exam': entranceExam,
    'work description': workDescription,
    'pros and cons': {
      pros,
      cons
    }
  };
}

// For testing: read a local HTML file and print the extracted JSON
if (require.main === module) {
  const html = fs.readFileSync('./output/careerlibrary/actuarial-sciences/acturial-sciences-as-a-career-in-india/page.html', 'utf-8');
  const data = extractData(html);
  console.log(JSON.stringify(data, null, 2));
}

module.exports = extractData;