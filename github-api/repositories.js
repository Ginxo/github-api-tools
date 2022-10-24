const { logger } = require("../common");

getOwnerRepositories = async (octokitInstance, org, page = 1, per_page = 100) => {
    logger.debug(`Repositories for ${org}. Page ${page} Per Page ${per_page}`)
    const { status, data } = await octokitInstance.request(`GET /orgs/${org}/repos`, {
        org,
        page,
        per_page
    });
    if (status == 200) {
        if (data && data.length > 0) {
            return [...data, ...(await getOwnerRepositories(octokitInstance, org, ++page, per_page))]
        } else {
            return []
        }
    }
};

module.exports = { getOwnerRepositories }