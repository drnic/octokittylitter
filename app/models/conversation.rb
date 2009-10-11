class Conversation < ActiveRecord::Base
  has_many :messages
  
  def number
    id
  end
end
