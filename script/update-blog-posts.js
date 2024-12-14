import {readFileSync, writeFileSync} from 'node:fs';

import {XMLParser} from "fast-xml-parser";

function getReadmeContent() {
    return readFileSync('README.md', 'utf-8');
}

function updateReadmeContent(content) {
    writeFileSync('README.md', content, 'utf-8');
}

function postsToMarkdown(posts) {
    const options = {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
      };

    return posts.map(post => {
        const pubDate = new Date(post.pubDate);
        const content = [`## [${post.title}](${post.link})`, post.description, pubDate.toLocaleDateString(undefined, options)].join('\n\n');
        return content.trim();
    }).join('\n\n');
}

const main = async () => {
    const DRYRUN = Boolean(JSON.parse(process.env.DRYRUN ?? "false"));

    try {
        const response = await fetch('https://schalkneethling.com/rss.xml');

        if (response.ok) {
            const data = await response.text();
            const parser = new XMLParser();
            const xml = parser.parse(data);

            const {rss} = xml;
            const entries = rss.channel.item.slice(0, 5);

            const postsContainerRegExp = /<!-- blog posts -->[\s\S]*<!-- \/blog posts -->/;
            const readmeContent = getReadmeContent();

            const postsAsMarkdown = postsToMarkdown(entries);
            const updatedReadmeContent = readmeContent.replace(postsContainerRegExp, `<!-- blog posts -->\n${postsAsMarkdown}\n<!-- /blog posts -->`);


            if (DRYRUN) {
                console.log(updatedReadmeContent);
            } else {
                updateReadmeContent(updatedReadmeContent);
            }
        }
    } catch (error) {
        console.error(error);           
    }
}

main();
