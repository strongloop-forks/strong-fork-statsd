StatsD Metric Types
==================

Names
-----

Metric names are sanitized to alphanumeric:

1. consecutive whitespace is replaced with `_`
2. `/` is replaced with `-`
3. anything that is not alpha-numeric, `_`, `-`, or `.` is removed


Counting
--------

    gorets:1|c

This is a simple counter. Add 1 to the "gorets" bucket.
At each flush the current count is sent and reset to 0.
If the count at flush is 0 then you can opt to send no metric at all for
this counter, by setting `config.deleteCounters` (applies only to graphite
backend).  Statsd will send both the rate as well as the count at each flush.

### Sampling

    gorets:1|c|@0.1

Tells StatsD that this counter is being sent sampled every 1/10th of the time.

Counter values can be positive or negative.

Every received counter value is multipled by 1/rate before adding to the
accumulator to account for the un-sampled values.

Timing
------

    glork:320|ms

The glork took 320ms to complete this time. StatsD figures out percentiles,
average (mean), standard deviation, sum, lower and upper bounds for the flush interval.
The percentile threshold can be tweaked with `config.percentThreshold`.

  XXX Also, count and `count_ps` (per second), of timers received. If there is a
  sample rate, the count is magnified by 1/rate to account for missing values.
  Sample rate is unused (and not useable) for any other purpose, for timers.

The percentile threshold can be a single value, or a list of values, and will
generate the following list of stats for each threshold:

    stats.timers.$KEY.mean_$PCT
    stats.timers.$KEY.upper_$PCT
    stats.timers.$KEY.sum_$PCT

    XXX error, this is .timer_data. not .timers.?
    XXX PCT is in range 0 to 100, and if it is 90.5, will be 90_5
    XXX default is 90?

Where `$KEY` is the stats key you specify when sending to statsd, and `$PCT` is
the percentile threshold. In calculating the stats for a threshold, only values
in that percentile are considered.

The default is 90, and the intention is ignore the most extreme variations in
timing in order to characterize typical values without distortion.

Note that the `mean` metric is the mean value of all timings recorded during
the flush interval whereas `mean_$PCT` is the mean of all timings which fell
into the `$PCT` percentile for that flush interval. And the same holds for sum
and upper. See [issue #157](https://github.com/etsy/statsd/issues/157) for a
more detailed explanation of the calculation.

If the count at flush is 0 then you can opt to send no metric at all for this timer,
by setting `config.deleteTimers`.

Use the `config.histogram` setting to instruct statsd to maintain histograms
over time.  Specify which metrics to match and a corresponding list of
ordered non-inclusive upper limits of bins (class intervals).
(use `inf` to denote infinity; a lower limit of 0 is assumed)
Each `flushInterval`, statsd will store how many values (absolute frequency)
fall within each bin (class interval), for all matching metrics.
Examples:

* no histograms for any timer (default): `[]`
* histogram to only track render durations,
  with unequal class intervals and catchall for outliers:

        [ { metric: 'render', bins: [ 0.01, 0.1, 1, 10, 'inf'] } ]

* histogram for all timers except 'foo' related,
  with equal class interval and catchall for outliers:

        [ { metric: 'foo', bins: [] },
          { metric: '', bins: [ 50, 100, 150, 200, 'inf'] } ]

Note:

* first match for a metric wins.
* bin upper limits may contain decimals.
* this is actually more powerful than what's strictly considered
histograms, as you can make each bin arbitrarily wide,
i.e. class intervals of different sizes.

Gauges
------

StatsD now also supports gauges, arbitrary values, which can be recorded.

    gaugor:333|g

If the gauge is not updated at the next flush, it will send the previous value. You can opt to send
no metric at all for this gauge, by setting `config.deleteGauges`

Adding a sign to the gauge value will change the value, rather than setting it.

    gaugor:-10|g
    gaugor:+4|g

So if `gaugor` was `333`, those commands would set it to `333 - 10 + 4`, or
`327`.

Note:

This implies you can't explicitly set a gauge to a negative number
without first setting it to zero.

Sets
----
StatsD supports counting unique occurences of events between flushes,
using a Set to store all occuring events.

    uniques:765|s

If the count at flush is 0 then you can opt to send no metric at all for this set, by
setting `config.deleteSets`.

Multi-Metric Packets
--------------------
StatsD supports receiving multiple metrics in a single packet by separating them
with a newline.

    gorets:1|c\nglork:320|ms\ngaugor:333|g\nuniques:765|s

Be careful to keep the total length of the payload within your network's MTU. There
is no single good value to use, but here are some guidelines for common network
scenarios:

* Fast Ethernet (1432) - This is most likely for Intranets.
* Gigabit Ethernet (8932) - Jumbo frames can make use of this feature much more
  efficient.
* Commodity Internet (512) - If you are routing over the internet a value in this
  range will be reasonable. You might be able to go higher, but you are at the mercy
  of all the hops in your route.

*(These payload numbers take into account the maximum IP + UDP header sizes)*


