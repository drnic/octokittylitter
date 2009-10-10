require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/messages/edit.html.erb" do
  include MessagesHelper

  before(:each) do
    assigns[:message] = @message = stub_model(Message,
      :new_record? => false,
      :from_github_login => "value for from_github_login",
      :message => "value for message",
      :github_id => "value for github_id"
    )
  end

  it "renders the edit message form" do
    render

    response.should have_tag("form[action=#{message_path(@message)}][method=post]") do
      with_tag('input#message_from_github_login[name=?]', "message[from_github_login]")
      with_tag('textarea#message_message[name=?]', "message[message]")
      with_tag('input#message_github_id[name=?]', "message[github_id]")
    end
  end
end
