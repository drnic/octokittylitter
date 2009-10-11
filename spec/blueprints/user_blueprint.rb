User.blueprint do
  login
  email
  password { 'password' }
  password_confirmation { 'password' }
end
