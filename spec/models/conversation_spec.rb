require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Conversation do
  before(:each) do
    @valid_attributes = {
      :number => 1
    }
  end

  it "should create a new instance given valid attributes" do
    Conversation.create!(@valid_attributes)
  end
end
