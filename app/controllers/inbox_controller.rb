class InboxController < ApplicationController
  before_filter :require_user
  
  def index
    @mailbox = "inbox"
    @messages = Message.inbox_for(current_user.login).paginate :page => params[:page], :per_page => 10
  end

  def sent
    @mailbox = "sent"
    @messages = Message.sent_from(current_user.login).paginate :page => params[:page], :per_page => 10
  end

  def show
    @conversation = Conversation.find(params[:id])
    render :action => :show, :layout => "envelope"
  end

  def new
  end

  def create
    @message = Message.new(params[:message].merge(:from => current_user.login, :unread => false))
    if @message.save
      flash[:notice] = "Your message has been sent."
      redirect_to(inbox_index_path)
    else
      render :action => "new"
    end
  end

  def create_reply
    reply_to = Conversation.find(params[:message_id])
    @message = Message.create(
      :reply_to => reply_to,
      :body     => params[:body], 
      :to       => reply_to.other_user(current_user.login),
      :from     => current_user.login,
      :unread   => false)
    flash[:notice] = "Your message has been sent."
    redirect_to(inbox_path(reply_to, :anchor => "reply"))
  end

end
