class Message < ActiveRecord::Base
  attr_accessor :sent_time_ago
  
  named_scope :unread, :conditions => { :unread => true }
  named_scope :inbox, :conditions => {:mailbox => "inbox"}, :order => "sent_at DESC"
  named_scope :sent_mailbox, :conditions => {:mailbox => "sent"}, :order => "sent_at DESC"
  
  validates_presence_of :mailbox
  validates_presence_of :from_github_login
  validates_presence_of :subject
  validates_presence_of :message
  validates_presence_of :github_message_number
  validates_format_of :sent_time_ago, :with => /^(|\d+[\. ](minutes?|hours?|days?)[\. ]ago)$/

  before_save :calculate_sent_at

  def calculate_sent_at
    if sent_time_ago.blank?
      self.sent_at = 0.days.ago
    else
      expression = sent_time_ago.gsub(/ /, '.')
      self.sent_at = eval(expression)
    end
  end
end
