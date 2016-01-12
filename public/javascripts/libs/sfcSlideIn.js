
(function($) {
    $.extend({
    	sfcSlideInActive: false,
    	sfcSlideIn: function(data) {
    		if($.sfcSlideInActive) {
    			return;
    		}
    		if(!data) {
    			data = {
    				sfc: 'BX-12316456453',
    				status: 'In Work',
    				materialVer: 'BOX-ITEM-1/A',
    				qty: 1,
    				shopOrder: 'BOX-ITEM-43535',
    				orderType: 'Production',
    				asBuild: {
    					comp1: 'BY-2131231',
    					comp2: 'BY-2121414',
    				},
    				dc: [{
    					name: 'DG1',
    					params: [{
    						name: 'Width',
    						value: '40cm',
    						operation: 'TEST',
    						resource: 'TEST-RES-1'
    					}, {
    						name: 'Length',
    						value: '60cm',
    						operation: 'TEST',
    						resource: 'TEST-RES-1'
    					}]
    				}, {
    					name: 'DG2',
    					params: [{
    						name: 'Weight',
    						value: '5kg',
    						operation: 'TEST',
    						resource: 'TEST-RES-1'
    					}]
    				}]
    			}
    		}
    		var sfcSlideIn;
    		if($('#sfcSlideIn').length > 0) {
				sfcSlideIn = $('#sfcSlideIn');
    		}
    		else {
    			var sfcSlideInDiv = `
    				<div id="sfcSlideIn" class="slideIn">
    					<div class="slideInTitle">
    						SFC Information
						</div>
						<div class="slideInRow">
							<div class="slideInItem">
								<b>SFC:</b><p data="sfc">${data.sfc}</p>
							</div>
							<div class="slideInItem">
								<b>Status:</b><p>${data.status}</p>
							</div>
						</div>
						<div class="slideInRow">
							<div class="slideInItem">
								<b>Material/Ver:</b><p>${data.materialVer}</p>
							</div>
							<div class="slideInItem">
								<b>Qty:</b><p>${data.qty}</p>
							</div>
						</div>
						<div class="slideInRow">
							<div class="slideInItem">
								<b>ShopOrder:</b><p>${data.shopOrder}</p>
							</div>
							<div class="slideInItem">
								<b>OrderType:</b><p>${data.orderType}</p>
							</div>
						</div>
						<div class="slideInCollapse">
							<div class="slideInCollapseTitle">
								<b>As-Build Information</b>
								<image id="asBuildArrow" src="/images/arrow-left.png" sfcCollapseContent="asBuildContent">
							</div>
							<div id="asBuildContent" class="slideInCollapseContent">
								<div class="slideInRow">
									<div class="slideInItem">
										<b>Component1:</b><p>${data.asBuild.comp1}</p>
									</div>
								</div>
								<div class="slideInRow">
									<div class="slideInItem">
										<b>Component2:</b><p>${data.asBuild.comp2}</p>
									</div>
								</div>
							</div>
						</div>
						<div class="slideInCollapse">
							<div class="slideInCollapseTitle">
								<b>DC Information</b>
								<image id="dcArrow" src="/images/arrow-left.png" sfcCollapseContent="dcContent">
							</div>
							<div id="dcContent" class="slideInCollapseContent">
								<table>
									<tr>
										<th>DC Group</th>
										<th>Param</th>
										<th>Value</th>
										<th>Operation</th>
										<th>Resource</th>
									</tr>
									<tr>
										<td rowspan="2">${data.dc[0].name}</td>
										<td>${data.dc[0].params[0].name}</td>
										<td>${data.dc[0].params[0].value}</td>
										<td>${data.dc[0].params[0].operation}</td>
										<td>${data.dc[0].params[0].resource}</td>
									</tr>
									<tr>
										<td>${data.dc[0].params[1].name}</td>
										<td>${data.dc[0].params[1].value}</td>
										<td>${data.dc[0].params[1].operation}</td>
										<td>${data.dc[0].params[1].resource}</td>
									</tr>
									<tr>
										<td>${data.dc[1].name}</td>
										<td>${data.dc[1].params[0].name}</td>
										<td>${data.dc[1].params[0].value}</td>
										<td>${data.dc[1].params[0].operation}</td>
										<td>${data.dc[1].params[0].resource}</td>
									</tr>
								</table>
							</div>
						</div>
						<div class="slideInCollapse">
							<div class="slideInCollapseTitle">
								<b>NC Information</b>
								<image id="ncArrow" src="/images/arrow-left.png" sfcCollapseContent="ncContent">
							</div>
							<div id="ncContent" class="slideInCollapseContent" style="padding-left: 5%">
								None
							</div>
						</div>
    				</div>
    				`;
				$('body:eq(0)').prepend(sfcSlideInDiv);

				$('[sfcCollapseContent]').each(function() {
					var contentId = $(this).attr('sfcCollapseContent');
					var content = $('#' + contentId);
					$(this).click(function(e) {
						var animationStyle = $(this).css('-webkit-animation');
						console.log(animationStyle);
						if(animationStyle !== 'rotate 0.5s ease 0s 1 normal forwards running') {
							$(this).css('-webkit-animation', 'rotate 0.5s forwards');
						}
						else {
							$(this).css('-webkit-animation', 'rotateBack 0.5s');
						}
						content.slideToggle();
					});
				});

    			sfcSlideIn = $('#sfcSlideIn');
    		}
    		sfcSlideIn.animate({"right":"0px"}, "slow");
    		$.sfcSlideInActive = true;
    	},
    	sfcSlideOut: function() {
    		if(!$.sfcSlideInActive) {
    			return;
    		}
    		var sfcSlideIn = $('#sfcSlideIn');
    		sfcSlideIn.animate({"right":"-500"}, "slow");
    		$.sfcSlideInActive = false;
    	}
    });
})(jQuery);