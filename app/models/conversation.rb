class Conversation < ActiveRecord::Base
  has_many :messages, :dependent => :destroy
  
  def number
    id
  end
  
  def users
    [messages.first.from, messages.first.to]
  end
  
  def other_user(login)
    (users - [login]).first
  end
end
