export const MOCK_AUTH_DATA = {
  token: 'mock-jwt-token',
  userId: 1,
  userRoleId: 1,
  email: 'admin@test.com',
  name: 'Admin User',
  centreId: 1,
  centreAdminId: 1
};

export const MOCK_AUTH_RESPONSE_SUCCESS = {
  result: {
    id: 1,
    userRoleID: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    centreID: 1,
    centreAdminId: 1,
    token: 'mock-jwt-token'
  },
  isSuccess: true,
  message: 'Login successful'
};

export const MOCK_AUTH_RESPONSE_ERROR = {
  isSuccess: false,
  message: 'Invalid credentials'
};
