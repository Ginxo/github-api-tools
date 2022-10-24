const { logger } = require("../common");

getHooks = async (octokitInstance, owner, repo, filters = {}) => {
    const { data } = await octokitInstance.request(`GET /repos/${owner}/${repo}/hooks`, {
        owner,
        repo
    });
    return data.filter(e => filters.payloadUrl ? e.config.url === filters.payloadUrl : true);
};

getDeliveries = async (octokitInstance, owner, repo, hook_id, filters = {}, cursor = undefined, per_page = 100) => {
    const { status, data } = await octokitInstance.request(`GET /repos/${owner}/${repo}/hooks/${hook_id}/deliveries`, {
        per_page,
        cursor
    });
    if (status == 200) {
        if (data && data.length > 1) {
            logger.debug(`[${owner}/${repo}] deliveries for hook ${hook_id}. Page ${cursor}. Date: ${data && data.length && data[0].delivered_at}. Length: ${data.length}`)
            const isEndingDateAlreadyExceeded = data.find(e => e.delivered_at >= filters.endingDate)
            const result = [...data.filter(deliveriesFilter(filters)), ...(!isEndingDateAlreadyExceeded ? await getDeliveries(
                octokitInstance,
                owner,
                repo,
                hook_id,
                filters,
                data[data.length - 1].id,
                per_page
            ) : [])];
            return result
        } else {
            return [];
        }
    }
};

deliveriesFilter = filters => e => {
    const delivered_at = Date.parse(e.delivered_at);
    const result = (filters.startingDate ? delivered_at >= filters.startingDate : true) &&
        (filters.endingDate ? delivered_at <= filters.endingDate : true)
    return result
}

module.exports = { getHooks, getDeliveries }