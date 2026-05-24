const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    res.status(result.status ?? 200).json(result.body);
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
};

module.exports = handle;
