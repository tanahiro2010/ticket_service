import "@typespec/http";
import "@typespec/rest";

using Http;
using Rest;
@service(#{ title: "Ticket Service" })
namespace TicketService.UniSchool.Api;

enum TicketStatus {
  OPEN,
  ENTERED,

  CALLED,
  CALLING,

  MEETING,
  CLOSED,
  CANCELED,
}

model Ticket {
  id: string;

  count: int32;
  num: string;
  prefix: string;
  index: int32;
  status: TicketStatus;

  rawAnswer: unknown;

  createdAt: utcDateTime;
  updatedAt: utcDateTime;
  closedAt: utcDateTime | null;
}

model MonitorTicket {
  id: string;
  num: string;
  status: TicketStatus;
}

model MonitorMeetingTicket extends MonitorTicket {
  updatedAt: utcDateTime;
  createdAt: utcDateTime;
}

model MonitorSkippedTicket extends MonitorTicket {
  updatedAt: utcDateTime;
}

model MonitorOpenTicket extends MonitorTicket {
  index: int32;
  createdAt: utcDateTime;
}

model Success<T> {
  success: true;
  message: string;
  data: T;
}

model Error {
  success: false;
  error: string;
}

model UpdateTicketStatusRequest {
  status: TicketStatus;
}

@route("/api/tickets")
interface Tickets {
  /** Read ticket by number. */
  @get readByNumber(@query number: string): Success<Ticket> | Error;

  /** Read ticket by id. */
  @route("/{id}")
  @get readById(@path id: string): Success<Ticket> | Error;

  /** Update ticket status by id. */
  @route("/{id}")
  @put updateStatus(
    @path id: string,
    @body body: UpdateTicketStatusRequest,
  ): Success<Ticket> | Error;

  /** Monitor payload by stage prefix. */
  @route("/monitor")
  @get monitor(
    @query stage: string,
  ): Success<{
    open: MonitorOpenTicket[];
    meeting: MonitorMeetingTicket[];
    skipped: MonitorSkippedTicket[];
  }> | Error;

  /** Distinct stage prefixes. */
  @route("/stages")
  @get stages(): Success<string[]> | Error;
}
