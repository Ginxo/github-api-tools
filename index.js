#!/usr/bin/env node

const { ClientError, logger } = require("./common");
const { getProcessEnvVariable, createOctokitInstance } = require("./utils/bin-utils");
const { getHooks } = require("./github-api/hooks");
const { program } = require('commander');
const { getOwnerRepositories } = require("./github-api/repositories");
const fs = require('fs');
const { saveFile, getDefaultFileName } = require("./utils/file-utils");
const path = require("path");

const yearAgo = new Date();
yearAgo.setFullYear(yearAgo.getFullYear() - 1);

program
    .requiredOption('-g, --group <string>', 'The Github group or owner to get repositories from')
    .option('-d, --debug', 'debug mode', false)
    .option('-sd, --starting-date <string>', 'date limit', yearAgo)
    .option('-ed, --ending-date <string>', 'date limit', yearAgo)
    .option('-p, --payload-url <string>', 'the Payload URL from github webhook')
    .option('-f, --file-path <string>', 'file path to save deliveries information', `${path.join(__dirname, getDefaultFileName())}`)
    .parse(process.argv);
const options = program.opts();

if (options.debug) {
    logger.level = "debug"
}

logger.debug("Options", options)

async function main() {
    const token = getProcessEnvVariable("GITHUB_TOKEN", false);
    const octokit = createOctokitInstance(token);
    const filters = { startingDate: options.startingDate ? Date.parse(options.startingDate) : undefined, endingDate: options.endingDate ? Date.parse(options.endingDate) : undefined, payloadUrl: options.payloadUrl };
    logger.debug("Filters", filters)

    logger.info(`Retrieving repositories for ${options.group}...`)
    const projects = (await getOwnerRepositories(octokit, options.group)).map(e => ({ owner: e.owner.login, repo: e.name }))
    logger.info(`${projects.length} projects retrieved for group ${options.group}`);
    logger.emptyLine();
    const deliveries = [];

    for (const project of projects) {
        logger.info(`[${project.owner}/${project.repo}] Retrieving hooks`);
        const hooks = await getHooks(octokit, project.owner, project.repo, filters);
        logger.debug(`[${project.owner}/${project.repo}] hooks`, hooks)

        if (!hooks?.length) {
            logger.info(`[${project.owner}/${project.repo}] No hooks.`)
        }
        for (const hook of hooks) {
            logger.info(`[${project.owner}/${project.repo}] Retrieving deliveries for hook ${hook.id} ${hook.config.url}`)
            const hookDeliveries = await getDeliveries(octokit, project.owner, project.repo, hook.id, filters);
            if (hookDeliveries.length) {
                logger.info(`[${project.owner}/${project.repo}] ${hookDeliveries.length} deliveries`)
                deliveries.push({ project: project, deliveries: hookDeliveries });
            } else {
                logger.info(`[${project.owner}/${project.repo}] No deliveries`)
            }
        }
        logger.emptyLine()
    }

    logger.info(`${deliveries.length} deliveries retrieved.`);
    if (deliveries.length) {
        saveFile(options.filePath, JSON.stringify(deliveries, null, 2));
        logger.info(`Output saved at ${options.filePath}.`);
    } else {
        logger.info("No deliveries to save.")
    }
}

if (require.main === module) {
    main().catch(e => {
        if (e instanceof ClientError) {
            process.exitCode = 2;
            console.error(e);
        } else {
            process.exitCode = 1;
            console.error(e);
        }
    });
}

module.exports = { main };