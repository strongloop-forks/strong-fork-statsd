/*
Graphite Required Variables:

(Leave these unset to avoid sending stats to Graphite.
 Set debug flag and leave these unset to run in 'dry' debug mode -
 useful for testing statsd clients without a Graphite server.)

  graphiteHost:     hostname or IP of Graphite server
  graphitePort:     port of Graphite server

Optional Variables:

  backends:         an array of backends to load. Each backend must exist
                    by name in the directory backends/. If not specified,
                    the default graphite backend will be loaded. 
                    * example for console and graphite:
                    [ "./backends/console", "./backends/graphite" ]
  server:           the server to load. The server must exist by name in the directory
                    servers/. If not specified, the default udp server will be loaded.
                    * example for tcp server:
                    "./servers/tcp"
  debug:            debug flag [default: false]
  address:          address to listen on [default: 0.0.0.0]
  address_ipv6:     defines if the address is an IPv4 or IPv6 address [true or false, default: false]
  port:             port to listen for messages on [default: 8125]
  mgmt_address:     address to run the management TCP interface on
                    [default: 0.0.0.0]
  mgmt_port:        port to run the management TCP interface on [default: 8126]
  title:            Allows for overriding the process title. [default: statsd]
                    if set to false, will not override the process title and let the OS set it.
                    The length of the title has to be less than or equal to the binary name + cli arguments
                    NOTE: This does not work on Mac's with node versions prior to v0.10

  healthStatus:     default health status to be returned and statsd process starts ['up' or 'down', default: 'up']
  dumpMessages:     log all incoming messages
  flushInterval:    interval (in ms) to flush metrics to each backend
  percentThreshold: for time information, calculate the Nth percentile(s)
                    (can be a single value or list of floating-point values)
                    negative values mean to use "top" Nth percentile(s) values
                    [%, default: 90]
  flush_counts:     send stats_counts metrics [default: true]

  keyFlush:         log the most frequently sent keys [object, default: undefined]
    interval:       how often to log frequent keys [ms, default: 0, means 'do not flush']
    percent:        percentage of frequent keys to log [%, default: 100]
    log:            location of log file for frequent keys [default: STDOUT]
  deleteIdleStats:  Normally, stats are reset after being reported, counters are set to
                    0, timers and sets are cleared, and gauges are left at their
                    last value. Because they are only reset, they will continue
                    to get reported, even if they are never received again. If
                    this is set to true, then the stats will instead be deleted
                    after being reported, so they won't be reported again until
                    they have been received.  Can be individually overriden.
                    [default: false]
  deleteGauges:     don't send values to graphite for inactive gauges, as opposed to sending the previous value [default: false]
  deleteTimers:     don't send values to graphite for inactive timers, as opposed to sending 0 [default: false]
  deleteSets:       don't send values to graphite for inactive sets, as opposed to sending 0 [default: false]
  deleteCounters:   don't send values to graphite for inactive counters, as opposed to sending 0 [default: false]
  prefixStats:      prefix to use for the statsd statistics data for this running instance of statsd [default: statsd]
                    applies to both legacy and new namespacing

  console:
    prettyprint:    whether to prettyprint the console backend
                    output [true or false, default: true]

  log:              log settings [object, default: undefined]
    backend:        where to log: stdout or syslog [string, default: stdout]
    application:    name of the application for syslog [string, default: statsd]
    level:          log level for [node-]syslog [string, default: LOG_INFO]

  graphite:
    legacyNamespace:  use the legacy namespace [default: true]
    globalPrefix:     global prefix to use for sending stats to graphite [default: "stats"]
    prefixCounter:    graphite prefix for counter metrics [default: "counters"]
    prefixTimer:      graphite prefix for timer metrics [default: "timers"]
    prefixGauge:      graphite prefix for gauge metrics [default: "gauges"]
    prefixSet:        graphite prefix for set metrics [default: "sets"]
    globalSuffix:     global suffix to use for sending stats to graphite [default: ""]
                      This is particularly useful for sending per host stats by
                      settings this value to: require('os').hostname().split('.')[0]

  repeater:         an array of hashes of the for host: and port:
                    that details other statsd servers to which the received
                    packets should be "repeated" (duplicated to).
                    e.g. [ { host: '10.10.10.10', port: 8125 },
                           { host: 'observer', port: 88125 } ]

  repeaterProtocol: whether to use udp4 or udp6 for repeaters.
                    ["udp4" or "udp6", default: "udp4"]

  histogram:        for timers, an array of mappings of strings (to match metrics) and
                    corresponding ordered non-inclusive upper limits of bins.
                    For all matching metrics, histograms are maintained over
                    time by writing the frequencies for all bins.
                    'inf' means infinity. A lower limit of 0 is assumed.
                    default: [], meaning no histograms for any timer.
                    First match wins.  examples:
                    * histogram to only track render durations, with unequal
                      class intervals and catchall for outliers:
                      [ { metric: 'render', bins: [ 0.01, 0.1, 1, 10, 'inf'] } ]
                    * histogram for all timers except 'foo' related,
                      equal class interval and catchall for outliers:
                     [ { metric: 'foo', bins: [] },
                       { metric: '', bins: [ 50, 100, 150, 200, 'inf'] } ]

  automaticConfigReload: whether to watch the config file and reload it when it
                         changes. The default is true. Set this to false to disable.
*/
{
  graphitePort: 2003
, graphiteHost: "localhost"
, port: 8125
, backends: [ "./backends/graphite" ]

// Prints to log like:
//   1 Oct 19:50:32 - DEBUG: numStats: 22
, debug: true

//, dumpMessages: true
// Prints to log (even if debug is false) like:
//   1 Oct 19:52:56 - DEBUG: loopback-example-app.samtu.1.loop.count:2|c

// Log is stdout or syslog (application name and log level configurable).
, log: {
    // backend: 'syslog', level: 'LOG_WARNING'
}

// backend: console
//
// Dumps the backend datastructure, its form is documented at
//   https://github.com/etsy/statsd/blob/master/docs/backend_interface.md
//
// Prints with util.inspect (pretty uses colors) like:
//   Flushing stats at  Wed Oct 01 2014 20:06:06 GMT-0700 (PDT)
//   { counters:
//      { 'statsd.bad_lines_seen': 0,
//        'statsd.packets_received': 20,
//        'loopback-example-app.samtu.0.loop.count': 9,
//        'loopback-example-app.samtu.1.http.connection.count': 0,
//        'loopback-example-app.samtu.1.loop.count': 2 },
//     timers: {},
//     gauges:
//      { 'loopback-example-app.samtu.0.gc.heap.used': 8796764,
//        'loopback-example-app.samtu.0.loop.average': 0.77778,
//        'loopback-example-app.samtu.1.loop.average': 0 },
//     timer_data: {},
//     counter_rates:
//      { 'statsd.bad_lines_seen': 0,
//        'statsd.packets_received': 2,
//        'loopback-example-app.samtu.0.loop.count': 0.9,
//        'loopback-example-app.samtu.1.http.connection.count': 0,
//        'loopback-example-app.samtu.1.loop.count': 0.2 },
//     sets: {},
//     pctThreshold: [ 90 ] }
, backends: [ "./backends/console" ]
, console: { prettyprint: true }

//, backends: [ "./backends/graphite", "./backends/console" ]
, graphite: {
    legacyNamespace: false, // doesn't do anything to console output, AFAICT
  }
}
