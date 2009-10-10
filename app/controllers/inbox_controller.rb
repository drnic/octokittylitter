class InboxController < ApplicationController
  def index
    @messages = Message.inbox.paginate :page => params[:page], :per_page => 10
  end

  def show
    @message = Message.find_by_github_message_number(params[:id])
    render :action => :show, :layout => "envelope"
  end

  def new
  end

  def create
    p params
  end

  def create_reply
    reply_number = params[:message_id].to_i
    @original_message = Message.find_by_github_message_number(reply_number)
    @message = Message.create(
      :body                  => params[:body], 
      :from_github_login     => @original_message.from_github_login,
      :subject               => @original_message.subject,
      :mailbox               => "sent",
      :unread                => false,
      :github_message_number => reply_number + 1)
    redirect_to(inbox_path(@message))
  end

  def sent
    @messages = Message.sent_mailbox.paginate :page => params[:page], :per_page => 10
  end

end
