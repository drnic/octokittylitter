class Message < ActiveRecord::Base
  attr_accessor :reply_to, :sent_time_ago, :subject
  attr_writer :number
  
  belongs_to :conversation
  
  named_scope :unread, :conditions => { :unread => true }
  named_scope :inbox_for, lambda { |login| 
    { :conditions => { :to => login }, :order => "sent_at DESC" }
  }
  named_scope :sent_from, lambda { |login| 
    { :conditions => { :from => login }, :order => "sent_at DESC" }
  }

  validates_presence_of :to, :from
  validates_presence_of :body
  validates_format_of :sent_time_ago, :with => /^(|\d+[\. ](minutes?|hours?|days?)[\. ]ago)$/

  before_create :assign_to_conversation
  before_save :calculate_sent_at

  # the Message might hold the conversation number temporarily from a form before assigning to Conversation
  def number
    @number || (conversation.try(:number))
  end
  
  def calculate_sent_at
    if sent_time_ago.blank?
      self.sent_at = 0.days.ago
    else
      expression = sent_time_ago.gsub(/ /, '.')
      self.sent_at = eval(expression)
    end
  end
  
  def assign_to_conversation
    self.conversation = if reply_to
      case reply_to
      when Message
        reply_to.conversation
      when Conversation
        reply_to
      else
        Conversation.find_by_id(reply_to) || Conversation.create
      end
    else
      Conversation.create(:subject => subject, :id => number)
    end
  end
end
