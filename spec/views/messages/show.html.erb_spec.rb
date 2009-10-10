require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/messages/show.html.erb" do
  include MessagesHelper
  before(:each) do
    assigns[:message] = @message = stub_model(Message,
      :from_github_login => "value for from_github_login",
      :message => "value for message",
      :github_id => "value for github_id"
    )
  end

  it "renders attributes in <p>" do
    render
    response.should have_text(/value\ for\ from_github_login/)
    response.should have_text(/value\ for\ message/)
    response.should have_text(/value\ for\ github_id/)
  end
end
