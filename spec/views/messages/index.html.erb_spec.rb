require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/messages/index.html.erb" do
  include MessagesHelper

  before(:each) do
    assigns[:messages] = [
      stub_model(Message,
        :from_github_login => "value for from_github_login",
        :message => "value for message",
        :github_id => "value for github_id"
      ),
      stub_model(Message,
        :from_github_login => "value for from_github_login",
        :message => "value for message",
        :github_id => "value for github_id"
      )
    ]
  end

  it "renders a list of messages" do
    render
    response.should have_tag("tr>td", "value for from_github_login".to_s, 2)
    response.should have_tag("tr>td", "value for message".to_s, 2)
    response.should have_tag("tr>td", "value for github_id".to_s, 2)
  end
end
