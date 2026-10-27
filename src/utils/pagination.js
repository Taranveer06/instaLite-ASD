function parsePagination(query) {
  let {page, limit} = query;

  page = page === undefined ? 1 : Number(page);
  limit = limit === undefined ? 10 : Number(limit);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return {error: 'page and limit must be positive integers'};
  }

  if (limit > 50) limit = 50;

  return {page, limit};
}

module.exports = {parsePagination};

