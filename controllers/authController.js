exports.login = (req, res) => {
    const { username, password } = req.body;
  
    // Mock authentication
    if (username === 'user' && password === 'password') {
      return res.status(200).json({ token: 'mock-jwt-token', message: 'Login successful' });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  };