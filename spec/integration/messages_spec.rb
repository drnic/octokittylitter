require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Messages" do
  context "created without replying" do
    subject { Message.create(:from => "drnic", :to => "defunkt", :subject => "subject", :body => "body")}
    it { should be_valid }
  end
  
  context "created as a reply" do
    before do
      @message = Message.create(:from => "drnic", :to => "defunkt", :subject => "subject", :body => "body")
    end
    subject { Message.create(:from => "defunkt", :to => "drnic", :reply_to => @message, :body => "response")}
    it { should be_valid }
    it { subject.conversation.messages.should == [@message, subject] }
  end
end
