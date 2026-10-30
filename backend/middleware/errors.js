export function notFound(req,res) {
  res.status(404).json({ success:false, message:`Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(err,req,res,next) {
  console.error(err);
  const status = Number(err.status) || 500;
  res.status(status).json({ success:false, message: status === 500 ? "Server error. Check backend logs and database configuration." : err.message });
}
