class InboxController < ApplicationController
  def index
    @messages = Message.inbox.paginate :page => params[:page], :per_page => 10
  end

  def show
  end

  def new
  end

  def create
  end

  def create_reply
  end

  def sent
    @messages = Message.sent_mailbox.paginate :page => params[:page], :per_page => 10
  end

end
