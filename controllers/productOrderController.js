const orders = []; // Mock order data

exports.createOrder = (req, res) => {
  const order = { id: orders.length + 1, ...req.body };
  orders.push(order);
  res.status(201).json({ message: 'Order created', order });
};

exports.cancelOrder = (req, res) => {
  const { orderId } = req.params;
  const index = orders.findIndex(order => order.id == orderId);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  orders.splice(index, 1);
  res.status(200).json({ message: 'Order canceled' });
};

exports.listOrders = (req, res) => {
  res.status(200).json(orders);
};