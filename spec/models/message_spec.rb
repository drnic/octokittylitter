require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Message do
  before(:each) do
    @valid_attributes = {
      :from => "drnic",
      :to => "defunkt",
      :sent_time_ago => "1 day ago",
      :subject => "subject",
      :body => "value for message"
    }
  end

  it "should create a new instance given valid attributes" do
    Message.create!(@valid_attributes)
  end
  
  describe "successfully created with sent_time_ago" do
    subject { Message.create!(@valid_attributes) }
    it "should set sent_at attribute" do
      subject.sent_at.to_s.should == 1.day.ago.to_s
    end
  end

  describe "successfully created without sent_time_ago" do
    subject { Message.create!(
      :from => "drnic",
      :to => "defunkt",
      :subject => "subject",
      :body => "value for message",
      :number => "123456") }
    it "should set sent_at attribute" do
      subject.sent_at.to_s.should == 0.days.ago.to_s
    end
  end

  context "created without replying" do
    subject { Message.create(:from => "drnic", :to => "defunkt", :subject => "subject", :body => "body")}
    it { should be_valid }
  end
  
  context "created as a reply" do
    before do
      @message = Message.create(:from => "drnic", :to => "defunkt", :subject => "subject", :body => "body")
    end
    subject { Message.create(:from => "defunkt", :to => "drnic", :reply_to => @message.conversation, :body => "response")}
    it { should be_valid }
    it { subject.conversation.messages.should == [@message, subject] }
  end
  
  context "inbox_for & sent_from" do
    before do
      @to = Message.make(:to => "drnic", :from => "defunkt")
      @from = Message.make(:from => "drnic", :to => "defunkt")
    end
    it { Message.inbox_for("drnic").should include(@to) }
    it { Message.inbox_for("defunkt").should_not include(@to) }
    it { Message.sent_from("drnic").should_not include(@to) }
    it { Message.sent_from("defunkt").should include(@to) }
  end
end
