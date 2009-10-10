class InboxController < ApplicationController
  def index
    @messages = Message.inbox.paginate :page => params[:page], :per_page => 10
  end

  def sent
    @messages = Message.sent_mailbox.paginate :page => params[:page], :per_page => 10
  end

  def show
    @message = Message.find_by_github_message_number(params[:id])
    render :action => :show, :layout => "envelope"
  end

  def new
  end

  def create
    params[:message][:from_github_login] = params[:message].delete(:to)
    @message = Message.new(params[:message].merge(:mailbox => "sent"))
    if @message.save
      flash[:notice] = "Your message has been sent."
      redirect_to(inbox_index_path)
    else
      render :action => "new"
    end
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
    flash[:notice] = "Your message has been sent."
    redirect_to(inbox_path(@message, :anchor => "reply"))
  end

end
