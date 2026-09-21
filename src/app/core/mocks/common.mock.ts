export const MOCK_GENERIC_RESPONSE_SUCCESS = {
  isSuccess: true,
  message: 'Operation successful',
  result: { id: 100, status: 'Active' }
};

export const MOCK_GENERIC_RESPONSE_ERROR = {
  isSuccess: false,
  message: 'An error occurred',
  result: null
};

export const MOCK_USER_PROFILE = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phoneNumber: '1234567890'
};
