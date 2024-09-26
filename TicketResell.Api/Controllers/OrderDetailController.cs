//using AutoMapper;
//using Api.Core.Entities;
//using Api.Core.Dtos.OrderDetail;
//using Api.Core.Validators;
//using Api.Repositories;
//using Microsoft.AspNetCore.Mvc;

//namespace Api.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class OrderDetailController : ControllerBase
//    {
//        private readonly IOrderDetailRepository _orderDetailRepository;
//        private readonly IOrderRepository _orderRepository;
//        private readonly IMapper _mapper;
//        private IValidatorFactory _validatorFactory;

//        public OrderDetailController(IOrderDetailRepository orderDetailRepository, IMapper mapper,
//            IOrderRepository orderRepository, IValidatorFactory validatorFactory)
//        {
//            _orderDetailRepository = orderDetailRepository;
//            _mapper = mapper;
//            _orderRepository = orderRepository;
//            _validatorFactory = validatorFactory;
//        }

//        [HttpPost]
//        public async Task<IActionResult> CreateOrderDetail([FromBody] OrderDetailDto dto)
//        {
//            var orderDetail = _mapper.Map<OrderDetail>(dto);
//            var validator = _validatorFactory.GetValidator<OrderDetail>();
//            var results = validator.Validate(orderDetail);

//            if (!results.IsValid)
//            {
//                return BadRequest(results.Errors);
//            }

//            var order = await _orderRepository.HasOrder(dto.OrderId);
//            if (order == false)
//            {
//                return NotFound($"Order with ID {dto.OrderId} not found.");
//            }

//            await _orderDetailRepository.CreateAsync(orderDetail);
//            return Ok(new { message = $"Successfully created orderDetail: {orderDetail.OrderDetailId}" });
//        }

//        [HttpGet("{id}")]
//        public async Task<ActionResult<OrderDetailDto>> GetOrderDetail(string id)
//        {
//            var orderDetail = await _orderDetailRepository.GetByIdAsync(id);


//            return Ok(_mapper.Map<OrderDetailDto>(orderDetail));
//        }

//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetAllOrderDetails()
//        {
//            var orderDetails = await _orderDetailRepository.GetAllAsync();
//            return Ok(orderDetails);
//        }

//        [HttpGet("buyer/{buyerId}")]
//        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetailsByBuyerId(string buyerId)
//        {
//            var orderDetails = await _orderDetailRepository.GetOrderDetailsByBuyerIdAsync(buyerId);
//            return Ok(orderDetails);
//        }

//        [HttpGet("seller/{sellerId}")]
//        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetailsBySellerId(string sellerId)
//        {
//            var orderDetails = await _orderDetailRepository.GetOrderDetailsBySellerIdAsync(sellerId);
//            return Ok(orderDetails);
//        }

//        [HttpPut]
//        public async Task<IActionResult> UpdateOrderDetail([FromBody] OrderDetailDto dto)
//        {
//            var orderDetail = _mapper.Map<OrderDetail>(dto);
//            var validator = _validatorFactory.GetValidator<OrderDetail>();
//            var results = await validator.ValidateAsync(orderDetail);

//            if (!results.IsValid)
//            {
//                return BadRequest(results.Errors);
//            }

//            var existingOrderDetail = await _orderDetailRepository.GetByIdAsync(orderDetail.OrderDetailId);


//            _mapper.Map(dto, existingOrderDetail);
//            await _orderDetailRepository.UpdateAsync(existingOrderDetail);
//            return Ok(new { message = $"Successfully updated orderDetail: {existingOrderDetail.OrderDetailId}" });
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteOrderDetail(string id)
//        {
//            var existingOrderDetail = await _orderDetailRepository.GetByIdAsync(id);

//            await _orderDetailRepository.DeleteAsync(existingOrderDetail);
//            return Ok(new { message = $"Successfully deleted orderDetail: {existingOrderDetail.OrderDetailId}" });
//        }
//    }
//}