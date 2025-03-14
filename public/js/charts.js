// Initialize all charts when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Listen for theme changes to update charts
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        updateChartsTheme();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // Get current theme colors
  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      textPrimary: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
      textSecondary: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
      surface: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
      surfaceHover: getComputedStyle(document.documentElement).getPropertyValue('--surface-hover').trim(),
      border: getComputedStyle(document.documentElement).getPropertyValue('--border').trim(),
      gridColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      axisColor: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
      tooltip: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
      
      // Additional colors for charts
      purple: '#8B5CF6',
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      orange: '#F59E0B',
      pink: '#EC4899',
      
      // Social media colors
      tiktok: '#FF4B4B',
      instagram: '#FF8A3D',
      twitter: '#3DB9DC',
      facebook: '#4B6FFF'
    };
  }
  
  // Initialize charts
  initTotalProfitChart();
  initPromotionalSalesChart();
  initSalesReportChart();
  
  // Update charts when theme changes
  function updateChartsTheme() {
    // Get fresh colors
    const colors = getThemeColors();
    
    // Update each chart with new theme colors
    if (window.totalProfitChart) {
      window.totalProfitChart.destroy();
      initTotalProfitChart();
    }
    
    if (window.promotionalSalesChart) {
      window.promotionalSalesChart.destroy();
      initPromotionalSalesChart();
    }
    
    if (window.salesReportChart) {
      window.salesReportChart.destroy();
      initSalesReportChart();
    }
  }
  
  // Total Profit Line Chart
  function initTotalProfitChart() {
    const colors = getThemeColors();
    const ctx = document.getElementById('totalProfitChart');
    
    if (!ctx) return;
    
    const gradientFill = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradientFill.addColorStop(0, `${colors.primary}30`); // Primary color with 30% opacity
    gradientFill.addColorStop(1, `${colors.primary}05`); // Primary color with 5% opacity

    window.totalProfitChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Total Profit',
          data: [7500, 6800, 8200, 7900, 8500, 9100, 8700, 9200, 9500, 9100, 8900, 9300],
          borderColor: colors.primary,
          backgroundColor: gradientFill,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.primary,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: colors.tooltip,
            titleColor: colors.textPrimary,
            bodyColor: colors.textSecondary,
            borderColor: colors.border,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `$${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 10
              }
            }
          },
          y: {
            grid: {
              color: colors.gridColor,
              borderDash: [5, 5]
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 10
              },
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    });
  }
  
  // Promotional Sales Donut Chart
  function initPromotionalSalesChart() {
    const colors = getThemeColors();
    const element = document.getElementById('promotionalSalesChart');
    
    if (!element) return;
    
    const options = {
      series: [40, 25, 15, 20],
      chart: {
        type: 'donut',
        height: 200,
        background: 'transparent',
        foreColor: colors.textPrimary
      },
      labels: ['Facebook', 'Instagram', 'Twitter', 'TikTok'],
      colors: [colors.facebook, colors.instagram, colors.twitter, colors.tiktok],
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      stroke: {
        width: 0
      },
      tooltip: {
        enabled: true,
        theme: document.documentElement.getAttribute('data-theme'),
        y: {
          formatter: function(value) {
            return value + '%';
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            background: 'transparent',
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                color: colors.textPrimary,
                formatter: function(val) {
                  return val + '%';
                }
              },
              total: {
                show: true,
                label: 'Reach',
                color: colors.textPrimary,
                formatter: function() {
                  return '78%';
                }
              }
            }
          }
        }
      }
    };

    window.promotionalSalesChart = new ApexCharts(element, options);
    window.promotionalSalesChart.render();
  }
  
  // Sales Report Bar and Line Chart
  function initSalesReportChart() {
    const colors = getThemeColors();
    const element = document.getElementById('salesReportChart');
    
    if (!element) return;
    
    const options = {
      series: [{
        name: 'Revenue',
        type: 'column',
        data: [4500, 5500, 4900, 6500, 5200, 6800, 5400, 5100, 6200, 5700, 6100, 7000]
      }, {
        name: 'Expenses',
        type: 'column',
        data: [3200, 4100, 3700, 4800, 3800, 5100, 4100, 3800, 4600, 4200, 4500, 5200]
      }, {
        name: 'Profit',
        type: 'line',
        data: [1300, 1400, 1200, 1700, 1400, 1700, 1300, 1300, 1600, 1500, 1600, 1800]
      }],
      chart: {
        height: 350,
        type: 'line',
        stacked: false,
        toolbar: {
          show: false
        }, 
        foreColor: colors.textPrimary,
        zoom: {
          enabled: false
        },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif'
      },
      stroke: {
        width: [0, 0, 3],
        curve: 'smooth'
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 3
        }
      },
      colors: [colors.primary, colors.purple, colors.blue],
      fill: {
        opacity: [1, 1, 1]
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        borderColor: colors.border,
        row: {
          colors: [colors.gridColor, 'transparent']
        }
      },
      markers: {
        size: 4,
        colors: [colors.blue],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 6
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: Array(12).fill(colors.textSecondary)
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: [
        {
          seriesName: 'Revenue',
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: colors.primary
          },
          labels: {
            style: {
              colors: Array(10).fill(colors.textSecondary)
            },
            formatter: function(val) {
              return '$' + val.toLocaleString();
            }
          },
          title: {
            text: "Revenue",
            style: {
              color: colors.textSecondary
            }
          }
        },
        {
          seriesName: 'Revenue',
          show: false
        },
        {
          opposite: true,
          seriesName: 'Profit',
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: colors.blue
          },
          labels: {
            style: {
              colors: Array(10).fill(colors.textSecondary)
            },
            formatter: function(val) {
              return '$' + val.toLocaleString();
            }
          },
          title: {
            text: "Profit",
            style: {
              color: colors.textSecondary
            }
          }
        }
      ],
      tooltip: {
        theme: document.documentElement.getAttribute('data-theme'),
        shared: true,
        intersect: false,
        y: {
          formatter: function(y) {
            if (typeof y !== "undefined") {
              return "$" + y.toLocaleString();
            }
            return y;
          }
        }
      },
      legend: {
        show: false
      }
    };

    window.salesReportChart = new ApexCharts(element, options);
    window.salesReportChart.render();
  }
});