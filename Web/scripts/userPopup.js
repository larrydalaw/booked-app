/**
 Copyright 2012-2015 Nick Korbel

 This file is part of Booked Scheduler.

 Booked Scheduler is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Booked Scheduler is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Booked Scheduler.  If not, see <http://www.gnu.org/licenses/>.
 */

$.fn.bindUserDetails = function (userId, options) {

	return $(this).each(function(index, value)
	{
			var self = $(value);
			var opts = $.extend({preventClick: true}, options);

			bind(self);

			function getDiv() {
				if ($('#userDetailsDiv').length <= 0)
				{
					return $('<div id="userDetailsDiv"/>').appendTo('body');
				}
				else
				{
					return $('#userDetailsDiv');
				}
			}

			function getUserForm() {
				if ($('#userFormDiv').length <= 0)
				{
					return $('<div id="userFormDiv"/>').appendTo('body');
				}
				else
				{
					return $('#userFormDiv');
				}
			}


			function hideDiv() {
				var tag = getDiv();
				var timeoutId = setTimeout(function () {
					tag.hide();
				}, 500);
				tag.data('timeoutId', timeoutId);
			}

			var hideDialog = function (dialogElement) {
				return function(){
					dialogElement.dialog('close');
				}
			};

			var getupdateurl = function (id) {
				return function () {
					return "/Web/admin/manage_users.php?action=updateUser&uid=" + id;
				};
			};

			function bind(userElement) {
				if (userElement.attr('user-details-bound') === '1')
				{
					return;
				}

				if (opts.preventClick)
				{
					userElement.click(function (e) {
						e.preventDefault();
						var idToLoad = userElement.attr('data-userid');
						var divUserForm = getUserForm();
						$.ajax({
							url: 'ajax/user_details.php?action=getForm&uid=' + idToLoad,
							type: 'GET',
							beforeSend: function () {
								divUserForm.html('Loading...');
								console.log('loading');
								$('#userDialog').dialog('destroy');
							},
							success: function (data, textStatus, jqXHR) {
								divUserForm.html(data);
								ConfigureAdminDialog($('#userDialog'));
								ConfigureAdminForm($('#userForm')
									, getupdateurl(idToLoad)
									, hideDialog($('#userDialog')));
								$('#userDialog').dialog('open');

								$(".save").click(function ()
								{
									$(this).closest('form').submit();
								});

								$(".cancel").click(function ()
								{
									$(this).closest('.dialog').dialog("close");
								});
							}
						});
					});
				}

				var tag = getDiv();

				tag.mouseenter(function () {
					clearTimeout(tag.data('timeoutId'));
				}).mouseleave(function () {
					hideDiv();
				});

				userElement.mouseenter(function () {
					var idToLoad = userId;
					if (!idToLoad)
					{
						idToLoad = userElement.attr('data-userid');
					}
					var tag = getDiv();
					clearTimeout(tag.data('timeoutId'));

					var data = tag.data('userPopup' + idToLoad);
					if (data != null)
					{
						showData(data);
					}
					else
					{
						$.ajax({
							url: 'ajax/user_details.php?uid=' + idToLoad,
							type: 'GET',
							cache: true,
							beforeSend: function () {
								tag.html('Loading...').show();
								tag.position({my: 'left bottom', at: 'right top', of: userElement});
							},
							error: tag.html('Error loading user data!').show(),
							success: function (data, textStatus, jqXHR) {
								tag.data('userPopup' + idToLoad, data);
								showData(data);
							}
						});
					}

					function showData(data) {
						tag.html(data).show();
						tag.position({my: 'left bottom', at: 'right top', of: userElement});
					}
				}).mouseleave(function () {
					hideDiv();
				});

				userElement.attr('user-details-bound', '1');
			}
	});
};