class User < ActiveRecord::Base
  acts_as_authentic
  
  attr_accessor :plan, :public_keys
end
