class Message < ActiveRecord::Base
  attr_accessor :reply_to, :sent_time_ago, :subject
  
  belongs_to :conversation
  
  delegate :number, :to => :conversation
  
  named_scope :unread, :conditions => { :unread => true }
  named_scope :inbox_for, lambda { |login| 
    { :conditions => { :to => login }, :order => "sent_at DESC" }
  }
  named_scope :sent_from, lambda { |login| 
    { :conditions => { :from => login }, :order => "sent_at DESC" }
  }

  validates_presence_of :to, :from
  validates_presence_of :subject, :unless => :reply_to
  validates_presence_of :body
  validates_format_of :sent_time_ago, :with => /^(|\d+[\. ](minutes?|hours?|days?)[\. ]ago)$/

  before_create :assign_to_conversation
  before_save :calculate_sent_at

  def calculate_sent_at
    if sent_time_ago.blank?
      self.sent_at = 0.days.ago
    else
      expression = sent_time_ago.gsub(/ /, '.')
      self.sent_at = eval(expression)
    end
  end
  
  def assign_to_conversation
    if reply_to
      reply_to = case reply_to
      when Message
        reply_to.conversation
      when Conversation
        reply_to
      else
        Conversation.find_by_id(reply_to) || Conversation.create
      end
      self.conversation = reply_to
    else
      self.conversation = Conversation.create(:subject => subject)
    end
  end
  
  def to_param
    github_message_number.to_s
  end
end
