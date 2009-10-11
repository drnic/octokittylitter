require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Conversation do
  context "created by Message.create" do
    subject { Message.create(:from => "drnic", :to => "defunkt", :subject => "subject", :body => "body").conversation }
    it { subject.subject.should == "subject" }
  end
end
