require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/messages/new.html.erb" do
  include MessagesHelper

  before(:each) do
    assigns[:message] = stub_model(Message,
      :new_record? => true,
      :from_github_login => "value for from_github_login",
      :message => "value for message",
      :github_id => "value for github_id"
    )
  end

  it "renders new message form" do
    render

    response.should have_tag("form[action=?][method=post]", messages_path) do
      with_tag("input#message_from_github_login[name=?]", "message[from_github_login]")
      with_tag("textarea#message_message[name=?]", "message[message]")
      with_tag("input#message_github_id[name=?]", "message[github_id]")
    end
  end
end
