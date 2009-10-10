require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Message do
  before(:each) do
    @valid_attributes = {
      :from_github_login => "value for from_github_login",
      :sent_at => Time.now,
      :message => "value for message",
      :github_id => "value for github_id"
    }
  end

  it "should create a new instance given valid attributes" do
    Message.create!(@valid_attributes)
  end
end
