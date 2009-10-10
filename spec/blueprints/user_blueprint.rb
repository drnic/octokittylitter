User.blueprint do
  login
  password { 'password' }
  password_confirmation { 'password' }
end
