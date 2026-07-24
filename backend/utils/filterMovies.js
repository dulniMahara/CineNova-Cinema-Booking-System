function buildMovieFilter(query) {
    const filter = {};

    if (query.genre) {
        filter.genre = { $in: Array.isArray(query.genre) ? query.genre : [query.genre] }
    }
    if (query.rating) {
        filter.rating = { $gte: Number(query.rating) };
    }
    if (query.title) {
        filter.title = { $regex: query.title, $options: "i" };
    }
    return filter;
}

module.exports = { buildMovieFilter };